import { KpiCard } from "@/pages/Admin/Dashboard/components/KpiCard";
import {
  CircleDollarSign,
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Percent,
  Wallet,
  PiggyBank,
  PieChart,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

export const OverviewCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });

  const stats = [
    {
      label: t("total_revenue"), // Doanh thu
      value: formatCurrency(summary.totalRevenue || 0),
      icon: <CircleDollarSign size={16} />,
      tone: "from-sky-500/10 border-sky-200 dark:from-cyan-500/15 dark:border-cyan-500/20 text-sky-600 dark:text-cyan-400",
    },
    {
      // Nếu chưa cập nhật i18n thì nó sẽ hiển thị "Tổng vốn"
      label: t("total_cost", "Tổng vốn"),
      value: formatCurrency(summary.totalCost || 0),
      icon: <Wallet size={16} />,
      tone: "from-slate-500/10 border-slate-200 dark:from-slate-500/15 dark:border-slate-500/20 text-slate-600 dark:text-slate-400",
    },
    {
      label: t("total_profit", "Lợi nhuận"),
      value: formatCurrency(summary.totalProfit || 0),
      icon: <PiggyBank size={16} />,
      tone: "from-indigo-500/10 border-indigo-200 dark:from-indigo-500/15 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: t("profit_margin", "Biên LN"),
      value: `${summary.profitMargin ?? 0}%`,
      icon: <PieChart size={16} />,
      tone: "from-fuchsia-500/10 border-fuchsia-200 dark:from-fuchsia-500/15 dark:border-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400",
    },
    {
      label: t("total_orders"),
      value: summary.totalOrders ?? 0,
      icon: <ShoppingCart size={16} />,
      tone: "from-violet-500/10 border-violet-200 dark:from-violet-500/15 dark:border-violet-500/20 text-violet-600 dark:text-violet-400",
    },
    {
      label: t("avg_order_value"),
      value: formatCurrency(summary.averageOrderValue || 0),
      icon: <ArrowUpRight size={16} />,
      tone: "from-emerald-500/10 border-emerald-200 dark:from-emerald-500/15 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: t("success_label"),
      value: `${summary.successRate ?? 0}%`,
      icon: <TrendingUp size={16} />,
      tone: "from-lime-500/10 border-lime-200 dark:from-lime-500/15 dark:border-lime-500/20 text-lime-600 dark:text-lime-400",
    },
    {
      label: t("cancel_rate"),
      value: `${summary.cancelRate ?? 0}%`,
      icon: <AlertTriangle size={16} />,
      tone: "from-rose-500/10 border-rose-200 dark:from-rose-500/15 dark:border-rose-500/20 text-rose-600 dark:text-rose-400",
    },
    {
      label: t("refund_rate"),
      value: `${summary.refundRate ?? 0}%`,
      icon: <Percent size={16} />,
      tone: "from-amber-500/10 border-amber-200 dark:from-amber-500/15 dark:border-amber-500/20 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    // Điều chỉnh lại Grid: Tối đa 3 thẻ trên 1 dòng để tránh bị quá bé do có 9 thẻ
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {stats.map((s, idx) => (
        <KpiCard key={idx} {...s} />
      ))}
    </div>
  );
};
