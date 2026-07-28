import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { BarChart3 } from "lucide-react";

const STATUS_CFG = {
  Processing: { label: "Chuẩn bị hàng", color: "from-amber-500 to-yellow-400" },
  Shipping: { label: "Đang giao", color: "from-sky-500 to-blue-500" },
  Delivered: { label: "Đã giao", color: "from-emerald-500 to-teal-400" },
  Cancelled: { label: "Đã hủy", color: "from-rose-500 to-red-500" },
  Refunded: { label: "Hoàn tiền", color: "from-purple-500 to-indigo-500" },
};

export const StatusBreakdown = ({ ordersByStatus = {}, totalOrders = 0 }) => {
  const rows = Object.entries(ordersByStatus);
  const maxVal = Math.max(...rows.map(([, c]) => Number(c)), 1);

  return (
    <Card
      title="Trạng thái đơn hàng"
      icon={<BarChart3 size={16} />}
      action={
        <span className="text-xs text-slate-500">{totalOrders} đơn</span>
      }
    >
      <div className="space-y-3 py-1">
        {rows.map(([st, count]) => {
          const num = Number(count || 0);
          const cfg = STATUS_CFG[st] || {
            label: st,
            color: "from-sky-500 to-blue-500",
          };
          return (
            <ProgressBar
              key={st}
              label={cfg.label}
              count={`${num} đơn`}
              color={cfg.color}
              percent={Math.max((num / maxVal) * 100, num > 0 ? 6 : 0)}
            />
          );
        })}
      </div>
    </Card>
  );
};
