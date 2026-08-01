import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Trophy } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

export const TopCustomersTable = ({ topCustomers = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  return (
    <Card title={t("top_customers")} icon={<Trophy size={16} />}>
      {topCustomers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">#</th>
                <th className="pb-2 pr-2 font-medium">{t("name_col")}</th>
                <th className="pb-2 pr-2 font-medium hidden sm:table-cell">
                  {t("email_col")}
                </th>
                <th className="pb-2 pr-2 font-medium text-right">
                  {t("orders_col")}
                </th>
                <th className="pb-2 pr-2 font-medium text-right">
                  {t("total_spent_col")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {topCustomers.map((c, i) => {
                const rankColor =
                  i === 0
                    ? "text-amber-500 dark:text-amber-400"
                    : i === 1
                      ? "text-slate-500 dark:text-slate-300"
                      : i === 2
                        ? "text-amber-700 dark:text-amber-600"
                        : "text-slate-400 dark:text-slate-500";
                return (
                  <tr
                    key={c.userId}
                    className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                  >
                    <td className={`py-2 pr-2 font-bold ${rankColor}`}>
                      {i + 1}
                    </td>
                    <td className="py-2 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                      {c.fullName}
                    </td>
                    <td className="py-2 pr-2 text-slate-500 dark:text-slate-400 truncate max-w-[160px] hidden sm:table-cell">
                      {c.email}
                    </td>
                    <td className="py-2 pr-2 text-right text-slate-700 dark:text-slate-300">
                      {c.orderCount}
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.totalSpent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          {t("no_data")}
        </div>
      )}
    </Card>
  );
};
