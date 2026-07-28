import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { History, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const MovementTable = ({ data = [] }) => (
  <Card title="Biến động tồn kho gần đây" icon={<History size={16} />}>
    {data.length ? (
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
            <th className="pb-2 pr-2 font-medium">Biến thể ID</th>
            <th className="pb-2 pr-2 font-medium">Loại</th>
            <th className="pb-2 pr-2 font-medium text-right">Số lượng</th>
            <th className="pb-2 pr-2 font-medium">Lý do</th>
            <th className="pb-2 pr-2 font-medium text-right">Ngày</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.id} className="border-b border-slate-900 last:border-0">
              <td className="py-1.5 pr-2 font-mono text-slate-400">#{m.variant_id}</td>
              <td className="py-1.5 pr-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    m.type === "IN" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {m.type === "IN" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {m.type}
                </span>
              </td>
              <td className="py-1.5 pr-2 text-right font-semibold">{m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}</td>
              <td className="py-1.5 pr-2 text-slate-400 truncate max-w-[180px]">{m.reason}</td>
              <td className="py-1.5 pr-2 text-right text-slate-500">{new Date(m.created_at).toLocaleDateString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
    )}
  </Card>
);
