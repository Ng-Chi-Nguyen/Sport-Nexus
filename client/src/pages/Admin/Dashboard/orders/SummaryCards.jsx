import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ShoppingCart, CheckCircle, Clock, Truck, XCircle, Undo2 } from "lucide-react";

const ITEMS = [
  { key: "totalOrders", label: "Tổng đơn", icon: <ShoppingCart size={16} />, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "delivered", label: "Đã giao", icon: <CheckCircle size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "processing", label: "Đang xử lý", icon: <Clock size={16} />, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "shipping", label: "Đang VC", icon: <Truck size={16} />, color: "text-sky-400", bg: "bg-sky-500/10" },
  { key: "cancelled", label: "Đã hủy", icon: <XCircle size={16} />, color: "text-red-400", bg: "bg-red-500/10" },
  { key: "refunded", label: "Hoàn tiền", icon: <Undo2 size={16} />, color: "text-violet-400", bg: "bg-violet-500/10" },
];

export const SummaryCards = ({ summary = {} }) => (
  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 items-start">
    {ITEMS.map((item) => (
      <Card key={item.key}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>{item.icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{summary[item.key] ?? 0}</p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);
