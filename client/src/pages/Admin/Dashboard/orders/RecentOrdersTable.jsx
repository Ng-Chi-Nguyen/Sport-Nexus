import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const STATUS_BADGE = {
  Processing: "bg-amber-500/10 text-amber-400",
  Shipping: "bg-sky-500/10 text-sky-400",
  Delivered: "bg-emerald-500/10 text-emerald-400",
  Cancelled: "bg-red-500/10 text-red-400",
  Refunded: "bg-violet-500/10 text-violet-400",
};

const PAYMENT_BADGE = {
  Paid: "bg-emerald-500/10 text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-400",
  Failed: "bg-red-500/10 text-red-400",
  Refunded: "bg-violet-500/10 text-violet-400",
};

export const RecentOrdersTable = ({ data = [] }) => (
  <Card title="Đơn hàng gần đây" icon={<Clock size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-2 font-medium">#</th>
              <th className="pb-2 pr-2 font-medium">Khách hàng</th>
              <th className="pb-2 pr-2 font-medium">Trạng thái</th>
              <th className="pb-2 pr-2 font-medium">Thanh toán</th>
              <th className="pb-2 pr-2 font-medium text-right">Tổng</th>
              <th className="pb-2 pr-2 font-medium text-right">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => (
              <tr key={o.id} className="border-b border-slate-900 last:border-0">
                <td className="py-1.5 pr-2 font-mono text-slate-400">#{o.id}</td>
                <td className="py-1.5 pr-2 text-slate-200 truncate max-w-[140px]">{o.userEmail}</td>
                <td className="py-1.5 pr-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[o.status] || "bg-slate-500/10 text-slate-400"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-1.5 pr-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PAYMENT_BADGE[o.paymentStatus] || "bg-slate-500/10 text-slate-400"}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-1.5 pr-2 text-right font-semibold text-slate-200">{formatCurrency(o.finalAmount)}</td>
                <td className="py-1.5 pr-2 text-right text-slate-500">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
    )}
  </Card>
);
