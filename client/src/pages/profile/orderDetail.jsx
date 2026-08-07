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
import { ArrowLeft, PackageCheck, Star } from "lucide-react";
import { TitleWithIcon } from "@/components/ui/title";
import Badge from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const OrderDetail = () => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const { order } = useLoaderData();
  const revalidator = useRevalidator();
  const [showReview, setShowReview] = useState(false);

  if (!order) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t("order_not_found", "Không tìm thấy đơn hàng")}
        </p>
        <Link
          to="/tai-khoan/don-hang"
          className="text-sky-600 dark:text-sky-400 hover:underline mt-3 inline-block font-semibold text-sm"
        >
          {t("back_to_list", "Quay lại danh sách")}
        </Link>
      </div>
    );
  }

  const ORDER_COLOR_MAP = {
    pending: "warning", // Chờ xử lý (màu vàng/cam)
    confirmed: "info", // Đã xác nhận (màu xanh dương)
    shipping: "indigo", // Đang giao hàng (màu chàm)
    completed: "success", // Hoàn thành (màu xanh lá)
    cancelled: "error", // Đã hủy (màu đỏ)
  };
  const PAYMENT_COLOR_MAP = {
    Paid: "success", // Đã thanh toán (màu xanh lá)
    Pending: "warning", // Chờ thanh toán (màu vàng/cam)
    Failed: "error", // Thất bại (màu đỏ)
    Refunded: "purple", // Hoàn tiền (màu tím)
  };

  const paymentMethodLabel =
    PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method;

  const reviewedIds = new Set(
    (order.Reviews || []).map((r) => r.product_id),
  );
  const hasPendingReview =
    order.status === "Delivered" &&
    (order.OrderItems || []).some(
      (item) => !reviewedIds.has(item.product_variant?.product_id),
    );

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200 space-y-6">
      <Link
        to="/tai-khoan/don-hang"
        className="inline-flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
      >
        <ArrowLeft size={16} />
        {t("back_to_orders", "Quay lại đơn hàng")}
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 dark:border-slate-900 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <TitleWithIcon
          icon={PackageCheck}
          title={`${t("order_title_prefix", "Đơn hàng")} #${order.id}`}
        />
        <div className="flex items-center gap-3">
          {order.status === "Delivered" && (
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
            >
              <Star size={15} />
              {hasPendingReview
                ? t("review_button", "Đánh giá")
                : t("review_edit_button", "Sửa đánh giá")}
            </button>
          )}
          <Badge color={ORDER_COLOR_MAP[order.status] || "gray"}>
            {STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            {t("order_date", "Ngày đặt")}
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {order.created_at ? formatFullDateTime(order.created_at) : "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            {t("payment_method", "Phương thức thanh toán")}
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {paymentMethodLabel}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            {t("payment_status", "Trạng thái thanh toán")}
          </p>
          <Badge color={PAYMENT_COLOR_MAP[order.payment_status] || "gray"}>
            {STATUS_PAYMENT[order.payment_status] || order.payment_status}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            {t("subtotal", "Tạm tính")}
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {formatCurrency(order.total_amount)}
          </p>
        </div>
        <div className="sm:col-span-2 space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            {t("shipping_address", "Địa chỉ giao hàng")}
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {order.shipping_address}
          </p>
        </div>
        {Number(order.discount_amount) > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
              {t("discount", "Giảm giá")}
            </p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(order.discount_amount)}
            </p>
          </div>
        )}
        {order.coupon_code && (
          <div className="space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
              {t("coupon_code", "Mã giảm giá")}
            </p>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
              {order.coupon_code}
            </p>
          </div>
        )}
        <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            {t("total_amount", "Tổng cộng")}
          </p>
          <p className="text-base font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(order.final_amount)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t("ordered_products", "Sản phẩm đã đặt")}
        </h3>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 custom-scrollbar">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-[15%]" />
              <col className="w-[12%]" />
              <col className="w-[23%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-3.5 px-4 text-left">
                  {t("product_column", "Sản phẩm")}
                </th>
                <th className="py-3.5 px-4 text-right">
                  {t("unit_price_column", "Đơn giá")}
                </th>
                <th className="py-3.5 px-4 text-right">
                  {t("quantity_column", "Số lượng")}
                </th>
                <th className="py-3.5 px-4 text-right">
                  {t("subtotal_column", "Tạm tính")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {order.OrderItems?.map((item) => {
                const variant = item.product_variant;
                const attributes = variant?.VariableAttributes?.map(
                  (attr) => `${attr.attributeKey?.name}: ${attr.value}`,
                ).join(", ");
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {variant?.product?.name ||
                            t("default_product_name", "Sản phẩm")}
                        </p>
                        {attributes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {attributes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.price_at_purchase)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(
                        Number(item.price_at_purchase) * Number(item.quantity),
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showReview && (
        <ReviewModal
          order={order}
          onClose={() => setShowReview(false)}
          onSuccess={() => revalidator.revalidate()}
        />
      )}
    </div>
  );
};

export default OrderDetail;
