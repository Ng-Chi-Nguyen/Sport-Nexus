import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import Pagination from "@/components/ui/pagination";

const INVOICE_LABELS = {
  Pending: "Chờ xử lý",
  Completed: "Đã hoàn thành",
  Cancelled: "Đã hủy",
};

const INVOICE_BADGE = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const Invoice = () => {
  const { invoices, pagination, user } = useLoaderData();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  if (!user) return null;

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Hóa đơn", route: "" },
          ]}
        />

        <div className="flex items-center justify-between mb-6 mt-4">
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            Hóa đơn của tôi
          </h1>
        </div>

        {invoices.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-900 p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D121F]/40">
            <p className="text-lg font-medium mb-2 text-slate-700 dark:text-slate-300">
              Chưa có hóa đơn
            </p>
            <p className="text-sm">
              Khi bạn đặt hàng và hóa đơn được phát hành, chúng sẽ xuất hiện tại
              đây
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                    <th className="py-3.5 px-4">Số hóa đơn</th>
                    <th className="py-3.5 px-4">Ngày phát hành</th>
                    <th className="py-3.5 px-4">Tổng tiền</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => navigate(`/hoa-don/${invoice.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-sky-600 dark:text-sky-400">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {invoice.issued_at ? formatDate(invoice.issued_at) : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-medium border ${INVOICE_BADGE[invoice.status] || ""}`}
                        >
                          {INVOICE_LABELS[invoice.status] || invoice.status}
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
    </div>
  );
};

export default Invoice;
