import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Trophy } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export const TopCustomersTable = ({ topCustomers = [] }) => {
  return (
    <Card
      title="Top khách mua nhiều nhất"
      icon={<Trophy size={16} />}
    >
      {topCustomers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-2 font-medium">#</th>
                <th className="pb-2 pr-2 font-medium">Tên</th>
                <th className="pb-2 pr-2 font-medium hidden sm:table-cell">
                  Email
                </th>
                <th className="pb-2 pr-2 font-medium text-right">Đơn</th>
                <th className="pb-2 pr-2 font-medium text-right">Tổng chi</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => {
                const rankColor =
                  i === 0
                    ? "text-amber-400"
                    : i === 1
                      ? "text-slate-300"
                      : i === 2
                        ? "text-amber-600"
                        : "text-slate-500";
                return (
                  <tr key={c.userId} className="border-b border-slate-900 last:border-0">
                    <td className={`py-2 pr-2 font-bold ${rankColor}`}>
                      {i + 1}
                    </td>
                    <td className="py-2 pr-2 font-medium text-slate-200 truncate max-w-[120px]">
                      {c.fullName}
                    </td>
                    <td className="py-2 pr-2 text-slate-400 truncate max-w-[160px] hidden sm:table-cell">
                      {c.email}
                    </td>
                    <td className="py-2 pr-2 text-right text-slate-300">
                      {c.orderCount}
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold text-emerald-400">
                      {formatCurrency(c.totalSpent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          Chưa có dữ liệu
        </div>
      )}
    </Card>
  );
};
