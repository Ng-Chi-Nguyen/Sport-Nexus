import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import { STATUS_BADGE, PAYMENT_BADGE } from "@/constants/web/profile";
import Pagination from "@/components/ui/pagination";

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

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          Đơn hàng của tôi
        </h2>
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
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md custom-scrollbar">
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
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${PAYMENT_BADGE[order.payment_status] || ""}`}
                      >
                        {STATUS_PAYMENT[order.payment_status] ||
                          order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_BADGE[order.status] || ""}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
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
