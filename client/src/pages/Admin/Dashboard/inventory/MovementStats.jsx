import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react";

const TYPE_META = {
  IN: { label: "Nhập kho", icon: <ArrowUpRight size={14} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  OUT: { label: "Xuất kho", icon: <ArrowDownRight size={14} />, color: "text-red-400", bg: "bg-red-500/10" },
  ADJUSTMENT: { label: "Điều chỉnh", icon: <RotateCcw size={14} />, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export const MovementStats = ({ movementCountByType = {}, movementTrend = [] }) => {
  const hasCounts = Object.keys(movementCountByType).length > 0;
  const totalMovements = Object.values(movementCountByType).reduce((s, v) => s + v, 0);
  const maxTrend = Math.max(...movementTrend.flatMap((d) => [d.IN || 0, d.OUT || 0, d.ADJUSTMENT || 0]), 1);

  return (
    <div>
      <Card title="Xu hướng nhập/xuất kho" icon={<ArrowUpDown size={16} />}>
        {hasCounts && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const count = movementCountByType[type] || 0;
              return (
                <div key={type} className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#08101E] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>{meta.icon}</div>
                    <div>
                      <p className="text-xs font-medium text-slate-200">{meta.label}</p>
                      <p className="text-[10px] text-slate-500">{type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${meta.color}`}>{count}</p>
                    <p className="text-[10px] text-slate-500">/{totalMovements}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {movementTrend.length ? (
          <div className="overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex h-[200px] items-end gap-1">
              {movementTrend.map((item) => {
                const inH = Math.max((Number(item.IN || 0) / maxTrend) * 100, 2);
                const outH = Math.max((Number(item.OUT || 0) / maxTrend) * 100, 2);
                const adjH = Math.max((Number(item.ADJUSTMENT || 0) / maxTrend) * 100, 2);
                return (
                  <div key={item.period} className="group relative flex min-w-[32px] flex-1 flex-col items-center">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-1 hidden rounded bg-slate-900 border border-slate-700 px-2 py-1 text-center shadow-lg group-hover:block whitespace-nowrap">
                      <span className="text-[9px] text-slate-400">{item.period}</span>
                      <span className="ml-2 text-[10px] text-emerald-400">IN: {item.IN || 0}</span>
                      <span className="ml-1.5 text-[10px] text-red-400">OUT: {item.OUT || 0}</span>
                      <span className="ml-1.5 text-[10px] text-amber-400">ĐC: {item.ADJUSTMENT || 0}</span>
                    </div>
                    <div className="flex h-[160px] w-full items-end rounded-lg border border-slate-800/80 bg-[#08101E] p-0.5 gap-px">
                      <div className="flex w-1/3 flex-col-reverse items-center h-full">
                        <div className="w-full rounded-sm bg-emerald-500/70 transition-all" style={{ height: `${inH}%` }} />
                      </div>
                      <div className="flex w-1/3 flex-col-reverse items-center h-full">
                        <div className="w-full rounded-sm bg-red-500/70 transition-all" style={{ height: `${outH}%` }} />
                      </div>
                      <div className="flex w-1/3 flex-col-reverse items-center h-full">
                        <div className="w-full rounded-sm bg-amber-500/70 transition-all" style={{ height: `${adjH}%` }} />
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 overflow-visible">{item.period.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
        )}
      </Card>
    </div>
  );
};
