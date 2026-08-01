import { Card } from "@/pages/Admin/Dashboard/components/Card";
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Undo2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const ITEMS = [
    {
      key: "totalOrders",
      label: t("total_orders"),
      icon: <ShoppingCart size={16} />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      key: "delivered",
      label: t("delivered"),
      icon: <CheckCircle size={16} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      key: "processing",
      label: t("processing"),
      icon: <Clock size={16} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      key: "shipping",
      label: t("shipping"),
      icon: <Truck size={16} />,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10 dark:bg-sky-500/20",
    },
    {
      key: "cancelled",
      label: t("cancelled"),
      icon: <XCircle size={16} />,
      color: "text-rose-600 dark:text-red-400",
      bg: "bg-rose-500/10 dark:bg-red-500/20",
    },
    {
      key: "refunded",
      label: t("refunded"),
      icon: <Undo2 size={16} />,
      color: "text-purple-600 dark:text-violet-400",
      bg: "bg-purple-500/10 dark:bg-violet-500/20",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 items-start">
      {ITEMS.map((item) => {
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
