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
import { Package } from "lucide-react";
import { TitleWithIcon } from "@/components/ui/title";
import Badge from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const Order = () => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const { orders, pagination, user } = useLoaderData();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [, setSearchParams] = useSearchParams();
  const [reviewOrder, setReviewOrder] = useState(null);

  if (!user) return null;

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <TitleWithIcon
          icon={Package}
          title={t("my_orders", "Đơn hàng của tôi")}
        />
      </div>

      {orders.length === 0 ? (
        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <p className="text-lg font-medium mb-2 text-slate-700 dark:text-slate-300">
            {t("no_orders", "Chưa có đơn hàng nào")}
          </p>
          <p className="text-sm">
            {t(
              "no_orders_desc",
              "Khi bạn đặt hàng, đơn hàng sẽ xuất hiện tại đây",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-3.5 px-4">{t("order_code")}</th>
                  <th className="py-3.5 px-4">{t("order_date")}</th>
                  <th className="py-3.5 px-4">{t("total_amount")}</th>
                  <th className="py-3.5 px-4">{t("payment_method")}</th>
                  <th className="py-3.5 px-4">{t("order_status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((order) => {
                  const reviewedIds = new Set(
                    (order.Reviews || []).map((r) => r.product_id),
                  );
                  const hasPendingReview =
                    order.status === "Delivered" &&
                    (order.OrderItems || []).some(
                      (item) =>
                        !reviewedIds.has(item.product_variant?.product_id),
                    );

                  const status = order.payment_status;
                  const isPaid = status === "Paid";

                  // Định nghĩa style màu sắc dạng soft/pastel qua className để đè lên style thô cũ
                  const paymentBadgeStyle = isPaid
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-medium";

                  const getOrderStatusStyle = (st) => {
                    if (st === "Delivered")
                      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium";
                    if (st === "Cancelled")
                      return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-medium";
                    return "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 px-2.5 py-1 rounded-full text-xs font-medium";
                  };

                  return (
                    <tr
                      key={order.id}
                      onClick={() =>
                        navigate(`/tai-khoan/don-hang/${order.id}`)
                      }
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-sky-600 dark:text-sky-400">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {order.created_at ? formatDate(order.created_at) : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(order.final_amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={paymentBadgeStyle}>
                          {STATUS_PAYMENT[status] || status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="flex flex-col items-start">
                          <span className={getOrderStatusStyle(order.status)}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                        <div>
                          {hasPendingReview && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewOrder(order);
                              }}
                              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                              {t("review_button")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                variant="light"
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      )}

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => revalidator.revalidate()}
        />
      )}
    </div>
  );
};

export default Order;
