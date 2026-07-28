import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { CreditCard, BarChart3 } from "lucide-react";

const STATUS_COLORS = {
  Processing: "bg-amber-400",
  Shipping: "bg-sky-400",
  Delivered: "bg-emerald-400",
  Cancelled: "bg-red-400",
  Refunded: "bg-violet-400",
};

export const StatusChart = ({ data = [] }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <Card title="Trạng thái đơn hàng" icon={<BarChart3 size={16} />}>
      {data.length ? (
        <div className="space-y-2.5">
          {data.map((d) => (
            <div key={d.status} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">{d.status}</span>
                <span className="font-semibold text-slate-200">{d.count}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${STATUS_COLORS[d.status] || "bg-slate-500"} transition-all duration-300`}
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
      )}
    </Card>
  );
};

const PMT_COLORS = {
  COD: "bg-emerald-500/10 text-emerald-400",
  BANK_TRANSFER: "bg-blue-500/10 text-blue-400",
  MOMO: "bg-violet-500/10 text-violet-400",
  VNPAY: "bg-sky-500/10 text-sky-400",
  CREDIT_CARD: "bg-amber-500/10 text-amber-400",
};

export const PaymentMethodChart = ({ data = [] }) => (
  <Card title="Phương thức thanh toán" icon={<CreditCard size={16} />}>
    {data.length ? (
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.method} className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#08101E] px-3 py-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${PMT_COLORS[d.method] || "bg-slate-500/10 text-slate-400"}`}>
              {d.method}
            </span>
            <span className="text-sm font-bold text-slate-200">{d.count}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
    )}
  </Card>
);
