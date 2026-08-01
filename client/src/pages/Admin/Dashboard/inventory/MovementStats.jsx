import { Card } from "@/pages/Admin/Dashboard/components/Card";
import {
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const MovementStats = ({
  movementCountByType = {},
  movementTrend = [],
}) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const TYPE_META = {
    IN: {
      label: t("type_in"),
      icon: <ArrowUpRight size={14} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    OUT: {
      label: t("type_out"),
      icon: <ArrowDownRight size={14} />,
      color: "text-rose-600 dark:text-red-400",
      bg: "bg-rose-500/10 dark:bg-red-500/20",
    },
    ADJUSTMENT: {
      label: t("type_adjustment"),
      icon: <RotateCcw size={14} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
  };
  const hasCounts = Object.keys(movementCountByType).length > 0;
  const totalMovements = Object.values(movementCountByType).reduce(
    (s, v) => s + v,
    0,
  );
  const maxTrend = Math.max(
    ...movementTrend.flatMap((d) => [d.IN || 0, d.OUT || 0, d.ADJUSTMENT || 0]),
    1,
  );

  return (
    <div>
      <Card title={t("movement_trend")} icon={<ArrowUpDown size={16} />}>
        {/* Khung đếm số lượng theo loại biên động */}
        {hasCounts && (
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const count = movementCountByType[type] || 0;
              return (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-xl border p-2.5 transition-colors duration-200
                             bg-slate-50 border-slate-200 
                             dark:bg-[#08101E] dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${meta.color}`}>{count}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      /{totalMovements}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Biểu đồ dạng cột (Trend Chart) */}
        {movementTrend.length ? (
          <div className="overflow-x-auto pb-3 custom-scrollbar">
            <div className="flex h-[200px] items-end gap-1">
              {movementTrend.map((item) => {
                const inH = Math.max(
                  (Number(item.IN || 0) / maxTrend) * 100,
                  2,
                );
                const outH = Math.max(
                  (Number(item.OUT || 0) / maxTrend) * 100,
                  2,
                );
                const adjH = Math.max(
                  (Number(item.ADJUSTMENT || 0) / maxTrend) * 100,
                  2,
                );

                return (
                  <div
                    key={item.period}
                    className="group relative flex min-w-[32px] flex-1 flex-col items-center"
                  >
                    {/* Tooltip khi hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-1 hidden rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-center shadow-lg group-hover:block whitespace-nowrap dark:bg-slate-900 dark:border-slate-700">
                      <span className="text-[9px] text-slate-400">
                        {item.period}
                      </span>
                      <span className="ml-2 text-[10px] text-emerald-400 font-semibold">
                        IN: {item.IN || 0}
                      </span>
                      <span className="ml-1.5 text-[10px] text-rose-400 font-semibold">
                        OUT: {item.OUT || 0}
                      </span>
                      <span className="ml-1.5 text-[10px] text-amber-400 font-semibold">
                        {t("adj_short")}: {item.ADJUSTMENT || 0}
                      </span>
                    </div>

                    {/* Khung chứa các cột thành phần */}
                    <div
                      className="flex h-[160px] w-full items-end rounded-lg border p-0.5 gap-px transition-colors duration-200
                                    bg-slate-50 border-slate-200 
                                    dark:bg-[#08101E] dark:border-slate-800/80"
                    >
                      {/* Cột Nhập Kho (IN) */}
                      <div className="flex w-1/3 flex-col-reverse items-center h-full">
                        <div
                          className="w-full rounded-sm bg-emerald-500/80 dark:bg-emerald-500/70 transition-all"
                          style={{ height: `${inH}%` }}
                        />
                      </div>
                      {/* Cột Xuất Kho (OUT) */}
                      <div className="flex w-1/3 flex-col-reverse items-center h-full">
                        <div
                          className="w-full rounded-sm bg-rose-500/80 dark:bg-red-500/70 transition-all"
                          style={{ height: `${outH}%` }}
                        />
                      </div>
                      {/* Cột Điều Chỉnh (ADJUSTMENT) */}
                      <div className="flex w-1/3 flex-col-reverse items-center h-full">
                        <div
                          className="w-full rounded-sm bg-amber-500/80 dark:bg-amber-500/70 transition-all"
                          style={{ height: `${adjH}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 mt-1 overflow-visible">
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
    </div>
  );
};
