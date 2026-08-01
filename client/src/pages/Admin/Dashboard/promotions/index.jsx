import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import {
  Gift,
  CheckCircle,
  XCircle,
  TicketCheck,
  Percent,
  Loader,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const SITEMS = [
    {
      key: "totalCoupons",
      label: t("total_codes"),
      icon: <Gift size={16} />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      key: "activeCoupons",
      label: t("active_coupons"),
      icon: <CheckCircle size={16} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      key: "inactiveCoupons",
      label: t("inactive_coupons"),
      icon: <XCircle size={16} />,
      color: "text-rose-600 dark:text-red-400",
      bg: "bg-rose-500/10 dark:bg-red-500/20",
    },
    {
      key: "totalUsage",
      label: t("total_usage"),
      icon: <TicketCheck size={16} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-4 items-start">
      {SITEMS.map((item) => {
        const val = summary[item.key] ?? 0;
        return (
          <Card key={item.key}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className={`text-lg font-bold truncate ${item.color}`}>
                  {val.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const CouponTable = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  return (
    <Card title={t("coupon_list")} icon={<Percent size={16} />}>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">{t("code_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("discount_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("used_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("remaining_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("rate_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("status_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {data.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                >
                  <td className="py-2 pr-2 font-mono font-bold text-sky-600 dark:text-sky-400">
                    {c.code}
                  </td>
                  <td className="py-2 pr-2 text-slate-800 dark:text-slate-200 font-medium">
                    {c.discount_type === "PERCENTAGE"
                      ? `${c.discount_value}%`
                      : formatCurrency(c.discount_value)}
                    {c.max_discount
                      ? ` ${t("max_discount", { value: formatCurrency(c.max_discount) })}`
                      : ""}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-700 dark:text-slate-300">
                    {c.usage_count}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-500 dark:text-slate-400">
                    {c.remaining}
                  </td>
                  <td className="py-2 pr-2 text-right font-bold text-slate-900 dark:text-slate-100">
                    {c.usageRate}%
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        c.is_active
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent"
                          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent"
                      }`}
                    >
                      {c.is_active ? t("active") : t("inactive")}
                    </span>
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

export const CouponOverview = () => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-coupon-overview"],
    queryFn: () => dashboardApi.getCouponOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        {t("loading_coupons")}
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <CouponTable data={data.coupons || []} />
    </div>
  );
};
