import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Layers, DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const ITEMS = [
  {
    key: "totalStock",
    label: "Tổng tồn kho",
    icon: <Layers size={16} />,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
  },
  {
    key: "stockValue",
    label: "Giá trị tồn kho",
    icon: <DollarSign size={16} />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    fmt: (v) => formatCurrency(v),
  },
  {
    key: "totalVariants",
    label: "Tổng biến thể",
    icon: <Package size={16} />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
];

export const SummaryCards = ({ summary = {} }) => (
  <div className="grid gap-3 sm:grid-cols-3 items-start">
    {ITEMS.map((item) => {
      const val = summary[item.key];
      const display = item.fmt ? item.fmt(val) : (val ?? 0).toLocaleString();
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
                {display}
              </p>
            </div>
          </div>
        </Card>
      );
    })}
  </div>
);
