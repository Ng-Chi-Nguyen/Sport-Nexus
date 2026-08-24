# Cancel & Return Order Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow customers to cancel orders in "Processing" status and request refunds for delivered orders.

**Architecture:** Add two new backend endpoints (`PATCH /customer/order/:id/cancel` and `PATCH /customer/order/:id/return`) with corresponding frontend modals and buttons on order detail/list pages. Cancel restores stock and updates invoice; return selects specific items, restores stock, processes refund, and updates order status.

**Tech Stack:** Express 5, Prisma ORM, React 19, React Router, TanStack Query, i18next, Lucide icons

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `server/src/services/customer/order.service.js` | Modify | Add `cancelOrder` and `returnOrder` functions |
| `server/src/controllers/customer/order.controller.js` | Modify | Add `cancelOrder` and `returnOrder` controller methods |
| `server/src/validators/customer/order.validator.js` | Modify | Add `cancelOrder` and `returnOrder` validation schemas |
| `server/src/routes/customer/order.route.js` | Modify | Add `PATCH /:id/cancel` and `PATCH /:id/return` routes |
| `client/src/api/customer/orderApi.jsx` | Modify | Add `cancel` and `returnOrder` API methods |
| `client/src/components/customer/CancelOrderModal.jsx` | Create | Confirmation modal for cancelling orders |
| `client/src/components/customer/ReturnOrderModal.jsx` | Create | Modal for selecting items to return with reason |
| `client/src/pages/profile/orderDetail.jsx` | Modify | Add cancel/return buttons |
| `client/src/pages/profile/order.jsx` | Modify | Add cancel button in order list |
| `client/src/locales/vi/profile.json` | Modify | Add Vietnamese translations |
| `client/src/locales/en/profile.json` | Modify | Add English translations |

---

## Task 1: Backend - Cancel Order Service

**Files:**
- Modify: `server/src/services/customer/order.service.js:454-458`

- [ ] **Step 1: Add cancelOrder function to orderService**

Add the following function after the `deleteOrder` function (line 458):

```javascript
cancelOrder: async (orderId, userId) => {
    const order = await prisma.Orders.findUnique({
        where: { id: Number(orderId) },
        include: {
            OrderItems: true,
            invoice: true,
            coupon: true,
        }
    });

    if (!order) {
        const err = new Error("Không tìm thấy đơn hàng");
        err.code = "ORDER_NOT_FOUND";
        throw err;
    }

    if (order.usersId !== userId) {
        const err = new Error("Bạn không có quyền hủy đơn hàng này");
        err.code = "FORBIDDEN";
        throw err;
    }

    if (order.status !== "Processing") {
        const err = new Error("Chỉ có thể hủy đơn hàng đang chờ xử lý");
        err.code = "INVALID_STATUS";
        throw err;
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Update order status to Cancelled
        const updatedOrder = await tx.Orders.update({
            where: { id: Number(orderId) },
            data: { status: "Cancelled" },
            include: { OrderItems: true }
        });

        // 2. Restore stock for all items
        for (const item of order.OrderItems) {
            await tx.productVariants.update({
                where: { id: item.product_variant_id },
                data: { stock: { increment: item.quantity } }
            });

            // Log stock movement
            await tx.StockMovements.create({
                data: {
                    variant_id: item.product_variant_id,
                    type: "IN",
                    quantity_change: item.quantity,
                    reason: `Hoàn hàng do hủy đơn #${orderId}`,
                    reference_id: Number(orderId)
                }
            });
        }

        // 3. Update invoice status if exists
        if (order.invoice) {
            await tx.invoices.update({
                where: { id: order.invoice.id },
                data: { status: "Cancelled" }
            });
        }

        // 4. Restore coupon usage if coupon was used
        if (order.coupon_code) {
            await tx.coupons.update({
                where: { code: order.coupon_code },
                data: { usage_count: { decrement: 1 } }
            });

            // Restore user coupon usage count
            if (order.usersId) {
                await tx.userCoupons.updateMany({
                    where: {
                        user_id: order.usersId,
                        coupon: { code: order.coupon_code }
                    },
                    data: { used_count: { decrement: 1 } }
                });
            }
        }

        return updatedOrder;
    });
},
```

- [ ] **Step 2: Verify syntax**

Run: `node -c server/src/services/customer/order.service.js`
Expected: No output (syntax OK)

---

## Task 2: Backend - Return Order Service

**Files:**
- Modify: `server/src/services/customer/order.service.js:458` (after cancelOrder)

- [ ] **Step 1: Add returnOrder function to orderService**

Add the following function after the `cancelOrder` function:

```javascript
returnOrder: async (orderId, userId, returnData) => {
    const { items, reason } = returnData;

    const order = await prisma.Orders.findUnique({
        where: { id: Number(orderId) },
        include: {
            OrderItems: true,
            invoice: true,
            PaymentTransactions: true,
        }
    });

    if (!order) {
        const err = new Error("Không tìm thấy đơn hàng");
        err.code = "ORDER_NOT_FOUND";
        throw err;
    }

    if (order.usersId !== userId) {
        const err = new Error("Bạn không có quyền trả hàng đơn này");
        err.code = "FORBIDDEN";
        throw err;
    }

    if (order.status !== "Delivered") {
        const err = new Error("Chỉ có thể trả hàng đơn đã giao thành công");
        err.code = "INVALID_STATUS";
        throw err;
    }

    // Validate return items exist in order
    const orderItemIds = order.OrderItems.map(item => item.id);
    for (const item of items) {
        if (!orderItemIds.includes(item.order_item_id)) {
            const err = new Error(`Sản phẩm ID ${item.order_item_id} không tồn tại trong đơn hàng`);
            err.code = "INVALID_ITEM";
            throw err;
        }
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Update order status to Refunded
        const updatedOrder = await tx.Orders.update({
            where: { id: Number(orderId) },
            data: { status: "Refunded" },
            include: { OrderItems: true }
        });

        // 2. Restore stock for returned items
        for (const item of items) {
            const orderItem = order.OrderItems.find(oi => oi.id === item.order_item_id);
            if (orderItem) {
                await tx.productVariants.update({
                    where: { id: orderItem.product_variant_id },
                    data: { stock: { increment: orderItem.quantity } }
                });

                // Log stock movement
                await tx.StockMovements.create({
                    data: {
                        variant_id: orderItem.product_variant_id,
                        type: "IN",
                        quantity_change: orderItem.quantity,
                        reason: `Hoàn hàng do trả hàng đơn #${orderId}: ${reason || "Không có lý do"}`,
                        reference_id: Number(orderId)
                    }
                });
            }
        }

        // 3. Update invoice status if exists
        if (order.invoice) {
            await tx.invoices.update({
                where: { id: order.invoice.id },
                data: { status: "Cancelled" }
            });
        }

        // 4. Process refund for payment transactions
        const paidTransactions = order.PaymentTransactions.filter(
            tx => tx.status === "Paid"
        );

        for (const transaction of paidTransactions) {
            await tx.paymentTransactions.update({
                where: { id: transaction.id },
                data: { status: "Refunded" }
            });
        }

        // 5. Update order payment status
        await tx.Orders.update({
            where: { id: Number(orderId) },
            data: { payment_status: "Refunded" }
        });

        return updatedOrder;
    });
},
```

- [ ] **Step 2: Verify syntax**

Run: `node -c server/src/services/customer/order.service.js`
Expected: No output (syntax OK)

---

## Task 3: Backend - Validators

**Files:**
- Modify: `server/src/validators/customer/order.validator.js:78`

- [ ] **Step 1: Add cancelOrder and returnOrder validation schemas**

Add the following after the `updateOrder` schema (line 77):

```javascript
cancelOrder: Joi.object({}),

returnOrder: Joi.object({
    items: Joi.array().items(
        Joi.object({
            order_item_id: Joi.number().integer().required().messages({
                'any.required': 'ID sản phẩm là bắt buộc'
            })
        })
    ).min(1).required().messages({
        'array.min': 'Phải chọn ít nhất một sản phẩm để trả'
    }),
    reason: Joi.string().max(500).allow(null).default(null)
}),
```

- [ ] **Step 2: Verify syntax**

Run: `node -c server/src/validators/customer/order.validator.js`
Expected: No output (syntax OK)

---

## Task 4: Backend - Controllers

**Files:**
- Modify: `server/src/controllers/customer/order.controller.js:310`

- [ ] **Step 1: Add cancelOrder controller method**

Add the following after the `deleteOrder` method (line 310):

```javascript
cancelOrder: async (req, res) => {
    const orderId = parseInt(req.params.id);
    const userId = req.user?.id;

    try {
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: t(req, "Vui lòng đăng nhập để hủy đơn hàng")
            });
        }

        const updatedOrder = await orderService.cancelOrder(orderId, userId);

        // Send email notification
        if (updatedOrder.user_email) {
            try {
                await emailService.sendOrderStatusUpdateEmail(
                    updatedOrder.user_email,
                    updatedOrder.user_email,
                    updatedOrder,
                    "Chuẩn bị hàng",
                    "Đã hủy",
                    PAYMENT_LABELS[updatedOrder.payment_method] || updatedOrder.payment_method,
                    PAYMENT_STATUS_LABELS[updatedOrder.payment_status] || updatedOrder.payment_status,
                );
            } catch (emailErr) {
                console.error(`[EMAIL] Gửi email hủy đơn thất bại:`, emailErr);
            }
        }

        return res.status(200).json({
            success: true,
            message: t(req, "Hủy đơn hàng thành công"),
            data: updatedOrder
        });
    } catch (error) {
        const status = error.code === "FORBIDDEN" ? 403 :
                       error.code === "INVALID_STATUS" ? 400 :
                       error.code === "ORDER_NOT_FOUND" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: t(req, error.message) || "Lỗi server nội bộ"
        });
    }
},

returnOrder: async (req, res) => {
    const orderId = parseInt(req.params.id);
    const userId = req.user?.id;
    const returnData = req.body;

    try {
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: t(req, "Vui lòng đăng nhập để trả hàng")
            });
        }

        const updatedOrder = await orderService.returnOrder(orderId, userId, returnData);

        // Send email notification
        if (updatedOrder.user_email) {
            try {
                await emailService.sendOrderStatusUpdateEmail(
                    updatedOrder.user_email,
                    updatedOrder.user_email,
                    updatedOrder,
                    "Đã giao",
                    "Hoàn tiền",
                    PAYMENT_LABELS[updatedOrder.payment_method] || updatedOrder.payment_method,
                    "Đã hoàn tiền",
                );
            } catch (emailErr) {
                console.error(`[EMAIL] Gửi email trả hàng thất bại:`, emailErr);
            }
        }

        return res.status(200).json({
            success: true,
            message: t(req, "Yêu cầu trả hàng thành công"),
            data: updatedOrder
        });
    } catch (error) {
        const status = error.code === "FORBIDDEN" ? 403 :
                       error.code === "INVALID_STATUS" ? 400 :
                       error.code === "INVALID_ITEM" ? 400 :
                       error.code === "ORDER_NOT_FOUND" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: t(req, error.message) || "Lỗi server nội bộ"
        });
    }
},
```

- [ ] **Step 2: Verify syntax**

Run: `node -c server/src/controllers/customer/order.controller.js`
Expected: No output (syntax OK)

---

## Task 5: Backend - Routes

**Files:**
- Modify: `server/src/routes/customer/order.route.js:31`

- [ ] **Step 1: Add cancel and return routes**

Add the following before the `delete` route (line 29):

```javascript
.patch("/:id/cancel", verifyToken, orderController.cancelOrder)
.patch("/:id/return", verifyToken, validate(orderSchema.returnOrder), orderController.returnOrder)
```

- [ ] **Step 2: Verify syntax**

Run: `node -c server/src/routes/customer/order.route.js`
Expected: No output (syntax OK)

---

## Task 6: Frontend - API Methods

**Files:**
- Modify: `client/src/api/customer/orderApi.jsx:33`

- [ ] **Step 1: Add cancel and returnOrder API methods**

Add the following after the `delete` method (line 33):

```javascript
cancel: (orderId) => {
    const url = `/customer/order/${orderId}/cancel`;
    return axiosClient.patch(url);
},

returnOrder: (orderId, data) => {
    const url = `/customer/order/${orderId}/return`;
    return axiosClient.patch(url, data);
},
```

- [ ] **Step 2: Verify syntax**

Run: `npm run build --prefix client`
Expected: Build succeeds

---

## Task 7: Frontend - CancelOrderModal Component

**Files:**
- Create: `client/src/components/customer/CancelOrderModal.jsx`

- [ ] **Step 1: Create CancelOrderModal component**

```jsx
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import orderApi from "@/api/customer/orderApi";
import ShowToast from "@/components/ui/toast";

const CancelOrderModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await orderApi.cancel(order.id);
      ShowToast.success(t("cancel_success", "Hủy đơn hàng thành công"));
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || t("cancel_error", "Không thể hủy đơn hàng");
      ShowToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl w-full max-w-md text-slate-800 dark:text-slate-100 transition-colors duration-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("cancel_title", "Xác nhận hủy đơn")}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-md">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t("cancel_warning", "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.")}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/60 p-3 space-y-2 text-sm rounded-md">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t("order_code")}</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t("total_amount")}</span>
              <span className="font-medium">{order.final_amount?.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer rounded-md"
          >
            {t("cancel_button", "Giữ đơn")}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer rounded-md"
          >
            {submitting ? (
              <span>{t("cancelling", "Đang hủy...")}</span>
            ) : (
              <span>{t("confirm_cancel", "Hủy đơn hàng")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
```

- [ ] **Step 2: Verify syntax**

Run: `npm run build --prefix client`
Expected: Build succeeds

---

## Task 8: Frontend - ReturnOrderModal Component

**Files:**
- Create: `client/src/components/customer/ReturnOrderModal.jsx`

- [ ] **Step 1: Create ReturnOrderModal component**

```jsx
import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatters";
import orderApi from "@/api/customer/orderApi";
import ShowToast from "@/components/ui/toast";

const ReturnOrderModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (orderItemId) => {
    setSelectedItems(prev =>
      prev.includes(orderItemId)
        ? prev.filter(id => id !== orderItemId)
        : [...prev, orderItemId]
    );
  };

  const handleReturn = async () => {
    if (selectedItems.length === 0) {
      ShowToast.error(t("return_select_items", "Vui lòng chọn ít nhất một sản phẩm để trả"));
      return;
    }

    setSubmitting(true);
    try {
      await orderApi.returnOrder(order.id, {
        items: selectedItems.map(id => ({ order_item_id: id })),
        reason: reason || null
      });
      ShowToast.success(t("return_success", "Yêu cầu trả hàng thành công"));
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || t("return_error", "Không thể xử lý yêu cầu trả hàng");
      ShowToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors duration-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("return_title", "Trả hàng hoàn tiền")}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("return_description", "Chọn các sản phẩm bạn muốn trả hàng. Số tiền hoàn lại sẽ được xử lý trong 3-5 ngày làm việc.")}
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("return_select_products", "Chọn sản phẩm trả")}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {order.OrderItems?.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedItems.includes(item.id)
                      ? "bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30"
                      : "bg-slate-50 dark:bg-[#111827]/40 border-slate-200 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    disabled={submitting}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_variant?.product?.name}</p>
                    <p className="text-xs text-slate-500">x{item.quantity} - {formatCurrency(item.price_at_purchase)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("return_reason", "Lý do trả hàng")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("return_reason_placeholder", "Nhập lý do trả hàng (không bắt buộc)...")}
              disabled={submitting}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#111827]/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer rounded-md"
          >
            {t("cancel_button", "Hủy")}
          </button>
          <button
            type="button"
            onClick={handleReturn}
            disabled={submitting || selectedItems.length === 0}
            className="flex-1 py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer rounded-md"
          >
            {submitting ? (
              <span>{t("return_submitting", "Đang xử lý...")}</span>
            ) : (
              <>
                <RotateCcw size={16} />
                <span>{t("return_submit", "Trả hàng")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderModal;
```

- [ ] **Step 2: Verify syntax**

Run: `npm run build --prefix client`
Expected: Build succeeds

---

## Task 9: Frontend - Update Order Detail Page

**Files:**
- Modify: `client/src/pages/profile/orderDetail.jsx:1-12`

- [ ] **Step 1: Update imports**

Replace the imports section (lines 1-12) with:

```jsx
import { useState } from "react";
import { useLoaderData, Link, useRevalidator } from "react-router-dom";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import {
  STATUS_BADGE,
  PAYMENT_BADGE,
  PAYMENT_METHOD_LABELS,
} from "@/constants/web/profile";
import ReviewModal from "@/components/customer/ReviewModal";
import CancelOrderModal from "@/components/customer/CancelOrderModal";
import ReturnOrderModal from "@/components/customer/ReturnOrderModal";
import { ArrowLeft, PackageCheck, Star, XCircle, RotateCcw } from "lucide-react";
import { TitleWithIcon } from "@/components/ui/title";
import Badge from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
```

- [ ] **Step 2: Add state variables**

After line 20 (`const [showReview, setShowReview] = useState(false);`), add:

```jsx
const [showCancel, setShowCancel] = useState(false);
const [showReturn, setShowReturn] = useState(false);
```

- [ ] **Step 3: Add cancel and return buttons**

After the review button block (lines 78-87), add the cancel and return buttons:

```jsx
{order.status === "Processing" && (
  <button
    type="button"
    onClick={() => setShowCancel(true)}
    className="inline-flex items-center gap-1.5 py-1 px-2 text-[10px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
  >
    <XCircle size={15} />
    {t("cancel_order_button", "Hủy đơn")}
  </button>
)}
{order.status === "Delivered" && (
  <button
    type="button"
    onClick={() => setShowReturn(true)}
    className="inline-flex items-center gap-1.5 py-1 px-2 text-[10px] font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
  >
    <RotateCcw size={15} />
    {t("return_button", "Trả hàng")}
  </button>
)}
```

- [ ] **Step 4: Add modal renderings**

After the ReviewModal block (lines 233-239), add:

```jsx
{showCancel && (
  <CancelOrderModal
    order={order}
    onClose={() => setShowCancel(false)}
    onSuccess={() => revalidator.revalidate()}
  />
)}
{showReturn && (
  <ReturnOrderModal
    order={order}
    onClose={() => setShowReturn(false)}
    onSuccess={() => revalidator.revalidate()}
  />
)}
```

- [ ] **Step 5: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds

---

## Task 10: Frontend - Update Order List Page

**Files:**
- Modify: `client/src/pages/profile/order.jsx:1-16`

- [ ] **Step 1: Update imports**

Replace the imports section (lines 1-16) with:

```jsx
import { useState } from "react";
import {
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import Pagination from "@/components/ui/pagination";
import ReviewModal from "@/components/customer/ReviewModal";
import CancelOrderModal from "@/components/customer/CancelOrderModal";
import { Package, XCircle } from "lucide-react";
import { TitleWithIcon } from "@/components/ui/title";
import Badge from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
```

- [ ] **Step 2: Add cancelOrder state**

After line 23 (`const [reviewOrder, setReviewOrder] = useState(null);`), add:

```jsx
const [cancelOrder, setCancelOrder] = useState(null);
```

- [ ] **Step 3: Add cancel button in table**

After the review button block (lines 125-136), add the cancel button:

```jsx
{order.status === "Processing" && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setCancelOrder(order);
    }}
    className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer"
  >
    {t("cancel_order_button", "Hủy đơn")}
  </button>
)}
```

- [ ] **Step 4: Add CancelOrderModal rendering**

After the ReviewModal block (lines 159-165), add:

```jsx
{cancelOrder && (
  <CancelOrderModal
    order={cancelOrder}
    onClose={() => setCancelOrder(null)}
    onSuccess={() => revalidator.revalidate()}
  />
)}
```

- [ ] **Step 5: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds

---

## Task 11: Frontend - Translations

**Files:**
- Modify: `client/src/locales/vi/profile.json:109`
- Modify: `client/src/locales/en/profile.json:109`

- [ ] **Step 1: Add Vietnamese translations**

In `client/src/locales/vi/profile.json`, add the following after `"review_update_submit"` (line 109):

```json
"cancel_order_button": "Hủy đơn",
"cancel_title": "Xác nhận hủy đơn",
"cancel_warning": "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.",
"cancel_success": "Hủy đơn hàng thành công",
"cancel_error": "Không thể hủy đơn hàng",
"cancel_button": "Giữ đơn",
"confirm_cancel": "Hủy đơn hàng",
"cancelling": "Đang hủy...",
"return_button": "Trả hàng",
"return_title": "Trả hàng hoàn tiền",
"return_description": "Chọn các sản phẩm bạn muốn trả hàng. Số tiền hoàn lại sẽ được xử lý trong 3-5 ngày làm việc.",
"return_select_products": "Chọn sản phẩm trả",
"return_reason": "Lý do trả hàng",
"return_reason_placeholder": "Nhập lý do trả hàng (không bắt buộc)...",
"return_select_items": "Vui lòng chọn ít nhất một sản phẩm để trả",
"return_success": "Yêu cầu trả hàng thành công",
"return_error": "Không thể xử lý yêu cầu trả hàng",
"return_submit": "Trả hàng",
"return_submitting": "Đang xử lý..."
```

- [ ] **Step 2: Add English translations**

In `client/src/locales/en/profile.json`, add the following after `"review_update_submit"` (line 109):

```json
"cancel_order_button": "Cancel Order",
"cancel_title": "Confirm Cancellation",
"cancel_warning": "Are you sure you want to cancel this order? This action cannot be undone.",
"cancel_success": "Order cancelled successfully",
"cancel_error": "Unable to cancel order",
"cancel_button": "Keep Order",
"confirm_cancel": "Cancel Order",
"cancelling": "Cancelling...",
"return_button": "Return",
"return_title": "Return & Refund",
"return_description": "Select the products you want to return. Refund will be processed within 3-5 business days.",
"return_select_products": "Select items to return",
"return_reason": "Return reason",
"return_reason_placeholder": "Enter return reason (optional)...",
"return_select_items": "Please select at least one item to return",
"return_success": "Return request submitted successfully",
"return_error": "Unable to process return request",
"return_submit": "Return Items",
"return_submitting": "Processing..."
```

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds

---

## Task 12: Final Verification

- [ ] **Step 1: Run backend syntax check**

Run: `node -c server/src/services/customer/order.service.js && node -c server/src/controllers/customer/order.controller.js && node -c server/src/routes/customer/order.route.js && node -c server/src/validators/customer/order.validator.js`
Expected: No output (all syntax OK)

- [ ] **Step 2: Run frontend build**

Run: `npm run build --prefix client`
Expected: Build succeeds with no errors

- [ ] **Step 3: Run frontend lint**

Run: `npm run lint --prefix client`
Expected: No errors

---

## Summary

This plan implements:

1. **Cancel Order Feature:**
   - Backend: `PATCH /customer/order/:id/cancel` endpoint
   - Frontend: Cancel button on order list and detail pages
   - Modal confirmation before cancellation
   - Stock restoration and invoice updates

2. **Return Order Feature:**
   - Backend: `PATCH /customer/order/:id/return` endpoint
   - Frontend: Return button on order detail page
   - Modal for selecting items and providing reason
   - Stock restoration and refund processing

Both features include:
- Proper authorization checks (only order owner can cancel/return)
- Status validation (only Processing orders can be cancelled, only Delivered orders can be returned)
- Stock restoration with movement logging
- Invoice status updates
- Email notifications
- i18n support (Vietnamese and English)
