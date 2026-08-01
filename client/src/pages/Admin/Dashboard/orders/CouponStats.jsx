import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Tags, Percent, DollarSign, Receipt } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

const PAYMENT_BADGE = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent",
  Pending:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent",
  Failed:
    "bg-rose-50 text-rose-600 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent",
  Refunded:
    "bg-purple-50 text-purple-600 border-purple-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-transparent",
};

export const CouponStats = ({ couponStats = {}, paymentStatuses = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const { withCoupon, withoutCoupon, couponRate, totalDiscount } = couponStats;

  const STATS = [
    {
      label: t("coupon_rate"),
      value: `${couponRate || 0}%`,
      icon: <Percent size={16} />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      label: t("orders_with_coupon"),
      value: (withCoupon ?? 0).toLocaleString(),
      icon: <Tags size={16} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      label: t("orders_without_coupon"),
      value: (withoutCoupon ?? 0).toLocaleString(),
      icon: <Receipt size={16} />,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10 dark:bg-slate-500/20",
    },
    {
      label: t("total_discount"),
      value: formatCurrency(totalDiscount || 0),
      icon: <DollarSign size={16} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
  ];

  return (
    <Card title={t("coupon_stats_title")} icon={<Tags size={16} />}>
      {/* Khung 4 chỉ số thống kê coupon */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 rounded-xl border p-2 transition-colors duration-200
                       bg-slate-50 border-slate-200 
                       dark:bg-[#08101E] dark:border-slate-800"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.color}`}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {s.label}
              </p>
              <p className={`text-sm font-bold truncate ${s.color}`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách trạng thái thanh toán */}
      <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {t("payment_status_title")}
      </h4>
      <div className="space-y-1.5">
        {paymentStatuses.length ? (
          paymentStatuses.map((ps) => (
            <div
              key={ps.status}
              className="flex items-center justify-between rounded-lg border px-3 py-1.5 transition-colors duration-200
                         bg-white border-slate-200 
                         dark:bg-[#0A111F] dark:border-slate-800/60"
            >
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  PAYMENT_BADGE[ps.status] ||
                  "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-transparent"
                }`}
              >
                {ps.status}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {ps.count.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="flex h-[60px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
            {t("no_data")}
          </div>
        )}
      </div>
    </Card>
  );
};
