import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import { STATUS_BADGE, PAYMENT_BADGE } from "@/constants/web/profile";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          Đơn hàng của tôi
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-slate-500">
          <p className="text-lg font-medium mb-2">Chưa có đơn hàng nào</p>
          <p className="text-sm">Khi bạn đặt hàng, đơn hàng sẽ xuất hiện tại đây</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Mã đơn hàng</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4">Thành tiền</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/tai-khoan/don-hang/${order.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-semibold text-blue-600">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {order.created_at ? formatDate(order.created_at) : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_BADGE[order.payment_status] || ""}`}
                      >
                        {STATUS_PAYMENT[order.payment_status] || order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[order.status] || ""}`}
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
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={14} />
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 text-sm rounded border transition-colors ${
                    p === currentPage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Sau
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Order;
