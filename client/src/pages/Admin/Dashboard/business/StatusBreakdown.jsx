import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const StatusBreakdown = ({ ordersByStatus = {}, totalOrders = 0 }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const STATUS_CFG = {
    Processing: { label: t("st_processing"), color: "from-amber-500 to-yellow-400" },
    Shipping: { label: t("st_shipping"), color: "from-sky-500 to-blue-500" },
    Delivered: { label: t("st_delivered"), color: "from-emerald-500 to-teal-400" },
    Cancelled: { label: t("st_cancelled"), color: "from-rose-500 to-red-500" },
    Refunded: { label: t("st_refunded"), color: "from-purple-500 to-indigo-500" },
  };

  const rows = Object.entries(ordersByStatus);
  const maxVal = Math.max(...rows.map(([, c]) => Number(c)), 1);

  return (
    <Card
      title={t("order_status")}
      icon={<BarChart3 size={16} />}
      action={
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {totalOrders} {t("unit_order")}
        </span>
      }
    >
      <div className="space-y-3 py-1">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            {t("no_status_data")}
          </p>
        ) : (
          rows.map(([st, count]) => {
            const num = Number(count || 0);
            const cfg = STATUS_CFG[st] || {
              label: st,
              color: "from-sky-500 to-blue-500",
            };
            return (
              <ProgressBar
                key={st}
                label={cfg.label}
                count={`${num} ${t("unit_order")}`}
                color={cfg.color}
                percent={Math.max((num / maxVal) * 100, num > 0 ? 6 : 0)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
};
