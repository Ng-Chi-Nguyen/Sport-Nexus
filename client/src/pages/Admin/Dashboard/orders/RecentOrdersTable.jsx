import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

const STATUS_BADGE = {
  Processing:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent",
  Shipping:
    "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-transparent",
  Delivered:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent",
  Cancelled:
    "bg-rose-50 text-rose-600 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent",
  Refunded:
    "bg-purple-50 text-purple-600 border-purple-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-transparent",
};

const PAYMENT_BADGE = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent",
  Pending:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent",
  Failed:
    "bg-rose-50 text-rose-600 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent",
  Refunded:
    "bg-purple-50 text-purple-600 border-purple-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-transparent",
};

export const RecentOrdersTable = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  return (
    <Card title={t("recent_orders")} icon={<Clock size={16} />}>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">#</th>
                <th className="pb-2 pr-2 font-medium">{t("customer_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("status_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("payment_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">
                  {t("total_label")}
                </th>
                <th className="pb-2 pr-2 font-medium text-right">
                  {t("date_col")}
                </th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {data.map((o) => (
              <tr
                key={o.id}
                className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
              >
                <td className="py-2 pr-2 font-mono text-slate-500 dark:text-slate-400">
                  #{o.id}
                </td>
                <td className="py-2 pr-2 text-slate-800 dark:text-slate-200 truncate max-w-[140px] font-medium">
                  {o.userEmail}
                </td>
                <td className="py-2 pr-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_BADGE[o.status] ||
                      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-transparent"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      PAYMENT_BADGE[o.paymentStatus] ||
                      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-transparent"
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-2 pr-2 text-right font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(o.finalAmount)}
                </td>
                <td className="py-2 pr-2 text-right text-slate-500 dark:text-slate-400">
                  {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
        {t("no_data")}
      </div>
    )}
    </Card>
  );
};
