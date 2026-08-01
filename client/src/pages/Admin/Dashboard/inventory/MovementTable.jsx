import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { History, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react";

export const MovementTable = ({ data = [] }) => (
  <Card title="Biến động tồn kho gần đây" icon={<History size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="pb-2 pr-2 font-medium">Biến thể ID</th>
              <th className="pb-2 pr-2 font-medium">Loại</th>
              <th className="pb-2 pr-2 font-medium text-right">Số lượng</th>
              <th className="pb-2 pr-2 font-medium">Lý do</th>
              <th className="pb-2 pr-2 font-medium text-right">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {data.map((m) => {
              const isIn = m.type === "IN";
              const isOut = m.type === "OUT";

              // Style và icon tương ứng theo loại biến động
              const badgeStyle = isIn
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent"
                : isOut
                  ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent"
                  : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent";

              const quantityStyle = isIn
                ? "text-emerald-600 dark:text-emerald-400"
                : isOut
                  ? "text-rose-600 dark:text-red-400"
                  : "text-amber-600 dark:text-amber-400";

              return (
                <tr
                  key={m.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                >
                  <td className="py-2 pr-2 font-mono text-slate-500 dark:text-slate-400">
                    #{m.variant_id}
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeStyle}`}
                    >
                      {isIn && <ArrowUpRight size={10} />}
                      {isOut && <ArrowDownRight size={10} />}
                      {!isIn && !isOut && <RotateCcw size={10} />}
                      {m.type}
                    </span>
                  </td>
                  <td
                    className={`py-2 pr-2 text-right font-bold ${quantityStyle}`}
                  >
                    {m.quantity_change > 0
                      ? `+${m.quantity_change}`
                      : m.quantity_change}
                  </td>
                  <td className="py-2 pr-2 text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                    {m.reason || "—"}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-500 dark:text-slate-400">
                    {new Date(m.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
        Chưa có dữ liệu
      </div>
    )}
  </Card>
);
