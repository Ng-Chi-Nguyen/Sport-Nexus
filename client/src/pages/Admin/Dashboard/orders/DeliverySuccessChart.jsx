import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export const DeliverySuccessChart = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const maxTotal = Math.max(...data.map((i) => Number(i.total || 0)), 1);

  return (
    <Card
      title={t("delivery_success_rate")}
      icon={<PackageCheck size={16} />}
      action={
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t("period_count", { count: data.length })}
        </span>
      }
    >
      {data.length ? (
        <div className="overflow-x-auto pb-3 custom-scrollbar">
          <div className="flex h-[200px] items-end gap-1">
            {data.map((item) => {
              const totalH = Math.max(
                (Number(item.total || 0) / maxTotal) * 100,
                4,
              );
              const deliveredH = Math.max(
                (Number(item.delivered || 0) / maxTotal) * 100,
                2,
              );
              const successRate = item.successRate || 0;

              return (
                <div
                  key={item.period}
                  className="group relative flex min-w-[28px] flex-1 flex-col items-center"
                >
                  {/* Tooltip khi di chuột vào cột */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-1 hidden rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-center shadow-lg group-hover:block whitespace-nowrap dark:bg-slate-900 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400">
                      {item.period}
                    </span>
                    <span className="ml-2 text-[10px] text-slate-300">
                      {t("total_prefix")} {item.total}
                    </span>
                    <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold">
                      {t("delivered_prefix")} {item.delivered}
                    </span>
                    <span className="ml-1.5 text-xs font-bold text-sky-400">
                      {successRate}%
                    </span>
                  </div>

                  {/* Khung chứa cột biểu đồ */}
                  <div
                    className="flex h-[160px] w-full items-end rounded-lg border p-0.5 relative overflow-hidden transition-colors duration-200
                                  bg-slate-50 border-slate-200 
                                  dark:bg-[#08101E] dark:border-slate-800/80"
                  >
                    <div className="absolute top-1 left-1 text-[9px] font-bold text-sky-600 dark:text-sky-400 z-10">
                      {successRate}%
                    </div>
                    {/* Cột đại diện tổng đơn (nền phía sau) */}
                    <div
                      className="w-full rounded-sm bg-slate-200 dark:bg-slate-700/30 transition-all"
                      style={{ height: `${totalH}%` }}
                    />
                    {/* Cột giao thành công (nằm đè phía trước) */}
                    <div
                      className="absolute bottom-0.5 left-0.5 w-[calc(100%-4px)] rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all shadow-sm"
                      style={{ height: `${deliveredH}%` }}
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
        <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          {t("no_data")}
        </div>
      )}
    </Card>
  );
};
