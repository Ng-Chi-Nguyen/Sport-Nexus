import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const NewOrdersTrend = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const maxCount = Math.max(...data.map((i) => Number(i.count || 0)), 1);

  return (
    <Card
      title={t("new_orders_over_time")}
      icon={<TrendingUp size={16} />}
      action={
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t("period_count", { count: data.length })}
        </span>
      }
    >
      {data.length ? (
        <div className="overflow-x-auto pb-3 custom-scrollbar">
          <div className="flex h-[180px] items-end gap-1">
            {data.map((item) => {
              const height = Math.max(
                (Number(item.count || 0) / maxCount) * 100,
                4,
              );
              const hasVal = Number(item.count || 0) > 0;

              return (
                <div
                  key={item.period}
                  className="group relative flex min-w-[28px] flex-1 flex-col items-center"
                >
                  {/* Tooltip hiển thị khi hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-1 hidden rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-center shadow-lg group-hover:block whitespace-nowrap dark:bg-slate-900 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400">
                      {item.period}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-sky-400">
                      {t("order_count", { count: item.count })}
                    </span>
                  </div>

                  {/* Khung rãnh chứa cột */}
                  <div
                    className="flex h-[140px] w-full items-end rounded-lg border p-0.5 transition-colors duration-200
                                  bg-slate-50 border-slate-200 
                                  dark:bg-[#08101E] dark:border-slate-800/80"
                  >
                    <div
                      className={`w-full rounded-sm transition-all ${
                        hasVal
                          ? "bg-gradient-to-t from-sky-500 to-blue-400 shadow-[0_0_8px_rgba(56,189,248,0.2)]"
                          : "bg-slate-200 dark:bg-slate-800/30"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                    {item.period.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          {t("no_data")}
        </div>
      )}
    </Card>
  );
};
