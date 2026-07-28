import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { PackageCheck } from "lucide-react";

export const DeliverySuccessChart = ({ data = [] }) => {
  const maxTotal = Math.max(...data.map((i) => Number(i.total || 0)), 1);

  return (
    <Card
      title="Tỉ lệ giao thành công theo thời gian"
      icon={<PackageCheck size={16} />}
      action={<span className="text-xs text-slate-500">{data.length} mốc</span>}
    >
      {data.length ? (
        <div className="overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex h-[200px] items-end gap-1">
            {data.map((item) => {
              const totalH = Math.max((Number(item.total || 0) / maxTotal) * 100, 4);
              const deliveredH = Math.max((Number(item.delivered || 0) / maxTotal) * 100, 2);
              const successRate = item.successRate || 0;
              return (
                <div key={item.period} className="group relative flex min-w-[28px] flex-1 flex-col items-center">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-1 hidden rounded bg-slate-900 border border-slate-700 px-2 py-1 text-center shadow-lg group-hover:block whitespace-nowrap">
                    <span className="text-[9px] text-slate-400">{item.period}</span>
                    <span className="ml-2 text-[10px] text-slate-300">Tổng: {item.total}</span>
                    <span className="ml-1.5 text-[10px] text-emerald-400">Giao: {item.delivered}</span>
                    <span className="ml-1.5 text-xs font-semibold text-sky-400">{successRate}%</span>
                  </div>
                  <div className="flex h-[160px] w-full items-end rounded-lg border border-slate-800/80 bg-[#08101E] p-0.5 relative overflow-hidden">
                    <div className="absolute top-1 left-1 text-[9px] font-semibold text-sky-400 z-10">{successRate}%</div>
                    <div className="w-full rounded-sm bg-slate-700/30 transition-all" style={{ height: `${totalH}%` }} />
                    <div className="absolute bottom-0.5 w-[calc(100%-4px)] rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all" style={{ height: `${deliveredH}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500">{item.period.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
      )}
    </Card>
  );
};
