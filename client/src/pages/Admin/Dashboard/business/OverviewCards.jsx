import { KpiCard } from "@/pages/Admin/Dashboard/components/KpiCard";
import {
  CircleDollarSign,
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

export const OverviewCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const stats = [
    {
      label: t("total_revenue"),
      value: formatCurrency(summary.totalRevenue || 0),
      icon: <CircleDollarSign size={16} />,
      tone: "from-sky-500/10 border-sky-200 dark:from-cyan-500/15 dark:border-cyan-500/20",
    },
    {
      label: t("total_orders"),
      value: summary.totalOrders ?? 0,
      icon: <ShoppingCart size={16} />,
      tone: "from-violet-500/10 border-violet-200 dark:from-violet-500/15 dark:border-violet-500/20",
    },
    {
      label: t("avg_order_value"),
      value: formatCurrency(summary.averageOrderValue || 0),
      icon: <ArrowUpRight size={16} />,
      tone: "from-emerald-500/10 border-emerald-200 dark:from-emerald-500/15 dark:border-emerald-500/20",
    },
    {
      label: t("success_label"),
      value: `${summary.successRate ?? 0}%`,
      icon: <TrendingUp size={16} />,
      tone: "from-lime-500/10 border-lime-200 dark:from-lime-500/15 dark:border-lime-500/20",
    },
    {
      label: t("cancel_rate"),
      value: `${summary.cancelRate ?? 0}%`,
      icon: <AlertTriangle size={16} />,
      tone: "from-rose-500/10 border-rose-200 dark:from-rose-500/15 dark:border-rose-500/20",
    },
    {
      label: t("refund_rate"),
      value: `${summary.refundRate ?? 0}%`,
      icon: <Percent size={16} />,
      tone: "from-amber-500/10 border-amber-200 dark:from-amber-500/15 dark:border-amber-500/20",
    },
  ];

  return (
    <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((s, idx) => (
        <KpiCard key={idx} {...s} />
      ))}
    </div>
  );
};
