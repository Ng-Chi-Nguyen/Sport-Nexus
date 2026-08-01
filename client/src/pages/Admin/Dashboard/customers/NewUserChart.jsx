import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { UserPlus } from "lucide-react";

export const NewUserChart = ({ newUserTrend = [] }) => {
  const maxCount = Math.max(
    ...newUserTrend.map((i) => Number(i.count || 0)),
    1,
  );

  return (
    <Card
      title="User mới theo thời gian"
      icon={<UserPlus size={16} />}
      action={
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {newUserTrend.length} mốc
        </span>
      }
    >
      {newUserTrend.length ? (
        <div className="overflow-x-auto pb-3 custom-scrollbar">
          <div className="flex h-[223px] items-end gap-1">
            {newUserTrend.map((item) => {
              const height = Math.max(
                (Number(item.count || 0) / maxCount) * 100,
                4,
              );
              const hasCount = Number(item.count || 0) > 0;
              return (
                <div
                  key={item.period}
                  className="group relative flex min-w-[28px] flex-1 flex-col items-center"
                >
                  {/* Tooltip khi di chuột vào cột */}
                  <div className="absolute bottom-full z-50 mb-1 hidden rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-center shadow-lg dark:bg-slate-900 dark:border-slate-700 group-hover:block whitespace-nowrap">
                    <p className="text-[9px] text-slate-400">{item.period}</p>
                    <p className="text-xs font-semibold text-violet-400">
                      {item.count} user
                    </p>
                  </div>

                  {/* Khung chứa cột biểu đồ */}
                  <div className="flex h-[170px] w-full items-end rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-[#08101E] p-0.5 transition-colors duration-200">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        hasCount
                          ? "bg-gradient-to-t from-violet-500 to-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
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
        <div className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          Chưa có dữ liệu
        </div>
      )}
    </Card>
  );
};
