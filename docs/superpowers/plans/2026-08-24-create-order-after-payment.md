# Create Order After Payment Success - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Orders should only be fully created (stock deducted, invoice generated) after payment is confirmed via PayOS webhook, not at checkout time.

**Architecture:** Add a `Pending` status to `OrderStatus`. For online payments (PayOS, MOMO, etc.), create the order with `Pending` status and defer stock deduction + invoice creation until the PayOS webhook confirms payment. COD orders continue to be created with `Processing` status and stock deducted immediately.

**Tech Stack:** Prisma (schema + migration), Express.js (services, controllers), React (checkout flow)

---

## Current Flow (Problem)

```
Checkout → createOrder (Processing, deduct stock, create invoice, send email)
         → createPayment → redirect PayOS
         → Webhook → only updates payment_status: "Paid"
```

**Problem:** Order shows "Chuẩn bị hàng" (Processing) and stock is deducted BEFORE payment is confirmed.

## New Flow (Goal)

```
Checkout → createOrder (Pending, NO stock deduction, NO invoice)
         → createPayment → redirect PayOS
         → Webhook → status → "Processing" + deduct stock + create invoice + send email
```

For COD: unchanged (Processing + deduct stock immediately).

---

### Task 1: Add `Pending` status to Prisma schema

**Files:**
- Modify: `server/prisma/schema.prisma:294-300`
- Create: `server/prisma/migrations/20260824_add_pending_order_status.sql` (manual SQL for migration)

- [ ] **Step 1: Add Pending to OrderStatus enum**

In `server/prisma/schema.prisma`, change:
```prisma
enum OrderStatus {
  Pending
  Processing
  Shipping
  Delivered
  Cancelled
  Refunded
}
```

- [ ] **Step 2: Create migration SQL**

Run:
```bash
cd server && npx prisma migrate dev --name add_pending_order_status
```

- [ ] **Step 3: Verify**

Check that the migration runs without errors.

---

### Task 2: Modify `createOrder` service to handle online vs COD

**Files:**
- Modify: `server/src/services/customer/order.service.js:8-232`

- [ ] **Step 1: Skip stock deduction + invoice creation for online payments**

In `order.service.js`, inside the `createOrder` function within the `$transaction` block, after creating the order (line ~214), wrap the stock deduction, coupon increment, and invoice logic in a condition:

```javascript
// Only finalize (deduct stock, create invoice) for COD orders
// Online payments will be finalized in the webhook handler
const isOnlinePayment = ["BANK_TRANSFER", "MOMO", "VNPAY", "CREDIT_CARD"].includes(payment_method);

if (!isOnlinePayment) {
    // COD: deduct stock immediately
    if (coupon_code) {
        await tx.coupons.update({
            where: { code: coupon_code },
            data: { usage_count: { increment: 1 } }
        })
    }

    for (const item of items) {
        await tx.productVariants.update({
            where: { id: item.product_variant_id },
            data: { stock: { decrement: item.quantity } }
        })
    }

    // Create invoice for COD
    const subtotal = Number(total_amount) + Number(discount_amount);
    const vatRate = Number(process.env.VAT_RATE) || 0.08;
    const vatAmount = Math.round((subtotal - Number(discount_amount)) * vatRate * 100) / 100;
    const invoiceTotal = Math.round((subtotal - Number(discount_amount) + vatAmount) * 100) / 100;
    const invoiceNumber = await generateInvoiceNumber();

    const customer = orderEmail
        ? await tx.users.findFirst({ where: { email: orderEmail }, select: { full_name: true, email: true, phone_number: true } })
        : null;

    await tx.invoices.create({
        data: {
            order_id: newOrder.id,
            invoice_number: invoiceNumber,
            customer_name: customer?.full_name || orderEmail || 'Khách vãng lai',
            customer_email: customer?.email || null,
            customer_phone: customer?.phone_number || null,
            shipping_address: shipping_address,
            subtotal: subtotal,
            discount_amount: Number(discount_amount),
            vat_rate: vatRate,
            vat_amount: vatAmount,
            total_amount: invoiceTotal,
            note: payment_method ? `Phương thức thanh toán: ${payment_method}` : null
        }
    });
} else {
    // Online payment: set status to Pending, no stock deduction yet
    await tx.orders.update({
        where: { id: newOrder.id },
        data: { status: "Pending" }
    });
}
```

- [ ] **Step 2: Update order status in the create response**

Make sure the returned order has the correct status (Pending for online, Processing for COD).

- [ ] **Step 3: Verify**

Check that COD orders still work correctly (Processing status, stock deducted, invoice created).

---

### Task 3: Modify `handlePayosWebhook` to finalize order

**Files:**
- Modify: `server/src/services/customer/payment.service.js:260-277`

- [ ] **Step 1: Add finalization logic to webhook handler**

In `payment.service.js`, after updating `payment_status: "Paid"`, add logic to finalize the order if it's in `Pending` status:

```javascript
handlePayosWebhook: async (webhookData) => {
    const { payos } = await import("../../configs/payos.config.js");
    if (!payos) return null;

    const verified = await payos.webhooks.verify(webhookData);
    const transactionId = Number(verified.orderCode);
    const tx = await prisma.paymentTransactions.findUnique({
        where: { id: transactionId },
    });
    if (!tx || tx.status !== "Pending") return null;

    // Find the order
    const order = await prisma.orders.findUnique({
        where: { id: tx.order_id },
        include: {
            OrderItems: true,
            coupon: true,
        },
    });
    if (!order) return null;

    // Update transaction status
    await paymentService.updateTransactionStatus(tx.id, "Paid");

    // If order is Pending (online payment), finalize it
    if (order.status === "Pending") {
        await prisma.$transaction(async (txDB) => {
            // Update order status to Processing
            await txDB.orders.update({
                where: { id: order.id },
                data: {
                    payment_status: "Paid",
                    status: "Processing",
                },
            });

            // Deduct stock
            for (const item of order.OrderItems) {
                await txDB.productVariants.update({
                    where: { id: item.product_variant_id },
                    data: { stock: { decrement: item.quantity } },
                });

                // Create stock movement
                await txDB.stockMovements.create({
                    data: {
                        variant_id: item.product_variant_id,
                        type: "OUT",
                        quantity_change: -item.quantity,
                        reason: `Bán hàng - Đơn #${order.id}`,
                    },
                });
            }

            // Increment coupon usage
            if (order.coupon_code) {
                await txDB.coupons.update({
                    where: { code: order.coupon_code },
                    data: { usage_count: { increment: 1 } },
                });
            }

            // Create invoice
            const subtotal = Number(order.total_amount) + Number(order.discount_amount);
            const vatRate = Number(process.env.VAT_RATE) || 0.08;
            const vatAmount = Math.round((subtotal - Number(order.discount_amount)) * vatRate * 100) / 100;
            const invoiceTotal = Math.round((subtotal - Number(order.discount_amount) + vatAmount) * 100) / 100;

            // Generate invoice number
            const year = new Date().getFullYear();
            const start = new Date(`${year}-01-01T00:00:00Z`);
            const end = new Date(`${year + 1}-01-01T00:00:00Z`);
            const count = await txDB.invoices.count({ where: { issued_at: { gte: start, lt: end } } });
            const invoiceNumber = `HD-${year}-${String(count + 1).padStart(6, "0")}`;

            const customer = order.user_email
                ? await txDB.users.findFirst({ where: { email: order.user_email }, select: { full_name: true, email: true, phone_number: true } })
                : null;

            await txDB.invoices.create({
                data: {
                    order_id: order.id,
                    invoice_number: invoiceNumber,
                    customer_name: customer?.full_name || order.user_email || "Khách vãng lai",
                    customer_email: customer?.email || null,
                    customer_phone: customer?.phone_number || null,
                    shipping_address: order.shipping_address,
                    subtotal: subtotal,
                    discount_amount: Number(order.discount_amount),
                    vat_rate: vatRate,
                    vat_amount: vatAmount,
                    total_amount: invoiceTotal,
                    note: order.payment_method ? `Phương thức thanh toán: ${order.payment_method}` : null,
                },
            });
        });
    } else {
        // Already Processing (e.g., manual update), just update payment_status
        await prisma.orders.update({
            where: { id: tx.order_id },
            data: { payment_status: "Paid" },
        });
    }

    // Send confirmation email
    if (order.user_email) {
        try {
            const emailService = (await import("../../services/email/email.service.js")).default;
            await emailService.sendOrderConfirmationEmail(order.user_email, order.user_email, order, order.OrderItems, "Thanh toán qua PayOS", "Chuẩn bị hàng", "Đã thanh toán");
        } catch (e) {
            console.error("Gửi email xác nhận đơn hàng thất bại:", e.message);
        }
    }

    return { transactionId: tx.id, orderId: tx.order_id };
},
```

- [ ] **Step 2: Verify**

Check that webhook correctly finalizes Pending orders (deducts stock, creates invoice, sends email).

---

### Task 4: Update frontend Checkout to handle Pending status

**Files:**
- Modify: `client/src/pages/Checkout/index.jsx:197-233`
- Modify: `client/src/pages/Checkout/components/OrderSuccess.jsx`

- [ ] **Step 1: Handle Pending status in checkout**

The frontend currently redirects to PayOS after `createPayment`. This still works because the order is created (with Pending status) and the transaction is created. No frontend changes needed for the redirect flow.

- [ ] **Step 2: Update success page for Pending orders**

In `OrderSuccess.jsx`, if the order status is "Pending" and payment method is online, show "Đang chờ xác nhận thanh toán" instead of "Chuẩn bị hàng".

---

### Task 5: Update other webhook handlers (Casso)

**Files:**
- Modify: `server/src/services/customer/payment.service.js:279-326`

- [ ] **Step 1: Apply same finalization logic to Casso webhook**

Copy the same finalization logic from `handlePayosWebhook` to `handleCassoWebhook` — when payment is confirmed via Casso, if the order is `Pending`, finalize it (deduct stock, create invoice, update status to Processing).

---

### Task 6: Syntax check and build verification

- [ ] **Step 1: Run syntax check on server**

```bash
node -c server/src/services/customer/order.service.js
node -c server/src/services/customer/payment.service.js
```

- [ ] **Step 2: Build frontend**

```bash
npm run build --prefix client
```

- [ ] **Step 3: Verify no regressions**

Ensure COD orders still work correctly (Processing status, stock deducted, invoice created immediately).

---

## Notes

- **COD flow unchanged:** COD orders continue to be created with `Processing` status, stock deducted, invoice created immediately.
- **Online payment flow changed:** Orders created with `Pending` status, no stock deduction, no invoice. Finalized by webhook.
- **Email sent on webhook:** Confirmation email is sent after webhook finalization (not at checkout).
- **Stock movement logged:** Stock movements are created during webhook finalization.
- **Invoice generated on webhook:** Invoice is created during webhook finalization.
