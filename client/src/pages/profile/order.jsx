import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import { STATUS_BADGE, PAYMENT_BADGE } from "@/constants/web/profile";
import Pagination from "@/components/ui/pagination";
import { Package } from "lucide-react";
import { TitleWithIcon } from "@/components/ui/title";
import Badge from "@/components/ui/badge";

const Order = () => {
  const { orders, pagination, user } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user) return null;

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  const PAYMENT_COLOR_MAP = {
    Paid: "success",
    Pending: "warning",
    Failed: "error",
    Refunded: "purple",
  };

  const ORDER_COLOR_MAP = {
    completed: "success",
    pending: "warning",
    cancelled: "error",
    shipping: "info",
  };

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <TitleWithIcon icon={Package} title="Đơn hàng của tôi" />
      </div>

      {orders.length === 0 ? (
        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <p className="text-lg font-medium mb-2 text-slate-700 dark:text-slate-300">
            Chưa có đơn hàng nào
          </p>
          <p className="text-sm">
            Khi bạn đặt hàng, đơn hàng sẽ xuất hiện tại đây
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-3.5 px-4">Mã đơn hàng</th>
                  <th className="py-3.5 px-4">Ngày đặt</th>
                  <th className="py-3.5 px-4">Thành tiền</th>
                  <th className="py-3.5 px-4">Thanh toán</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/tai-khoan/don-hang/${order.id}`)}
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
                      <Badge
                        color={
                          order.payment_status === "Paid"
                            ? "success"
                            : "warning"
                        }
                      >
                        {STATUS_PAYMENT[order.payment_status] ||
                          order.payment_status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        color={
                          order.status === "completed"
                            ? "success"
                            : order.status === "cancelled"
                              ? "error"
                              : "nexus"
                        }
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default Order;
