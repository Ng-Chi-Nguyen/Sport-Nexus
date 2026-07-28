import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { TrendingUp } from "lucide-react";

export const TrendChart = ({ newProductTrend = [] }) => {
  const maxCount = Math.max(...newProductTrend.map((i) => Number(i.count || 0)), 1);

  return (
    <Card
      title="Sản phẩm mới theo thời gian"
      icon={<TrendingUp size={16} />}
      action={<span className="text-xs text-slate-500">{newProductTrend.length} mốc</span>}
    >
      {newProductTrend.length ? (
        <div className="overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex h-[180px] items-end gap-1">
            {newProductTrend.map((item) => {
              const height = Math.max((Number(item.count || 0) / maxCount) * 100, 4);
              return (
                <div key={item.period} className="group relative flex min-w-[28px] flex-1 flex-col items-center">
                  <div className="absolute bottom-full z-50 mb-1 hidden rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-center shadow-lg group-hover:block whitespace-nowrap">
                    <p className="text-[9px] text-slate-400">{item.period}</p>
                    <p className="text-xs font-semibold text-sky-400">{item.count} SP</p>
                  </div>
                  <div className="flex h-[140px] w-full items-end rounded-lg border border-slate-800/80 bg-[#08101E] p-0.5">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        item.count > 0
                          ? "bg-gradient-to-t from-sky-500 to-blue-400 shadow-[0_0_8px_rgba(56,189,248,0.2)]"
                          : "bg-slate-800/30"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500">{item.period.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
      )}
    </Card>
  );
};
