import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Tags, Percent, DollarSign, Receipt } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const PAYMENT_BADGE = {
  Paid: "bg-emerald-500/10 text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-400",
  Failed: "bg-red-500/10 text-red-400",
  Refunded: "bg-violet-500/10 text-violet-400",
};

export const CouponStats = ({ couponStats = {}, paymentStatuses = [] }) => {
  const { withCoupon, withoutCoupon, couponRate, totalDiscount } = couponStats;

  const STATS = [
    { label: "Tỉ lệ dùng coupon", value: `${couponRate || 0}%`, icon: <Percent size={16} />, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Đơn có coupon", value: withCoupon ?? 0, icon: <Tags size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Đơn không coupon", value: withoutCoupon ?? 0, icon: <Receipt size={16} />, color: "text-slate-400", bg: "bg-slate-500/10" },
    { label: "Tổng giảm giá", value: formatCurrency(totalDiscount || 0), icon: <DollarSign size={16} />, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <Card title="Thống kê coupon & thanh toán" icon={<Tags size={16} />}>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#08101E] px-3 py-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h4 className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Trạng thái thanh toán</h4>
      <div className="space-y-1.5">
        {paymentStatuses.length ? (
          paymentStatuses.map((ps) => (
            <div key={ps.status} className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-[#0A111F] px-3 py-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PAYMENT_BADGE[ps.status] || "bg-slate-500/10 text-slate-400"}`}>
                {ps.status}
              </span>
              <span className="text-sm font-bold text-slate-200">{ps.count}</span>
            </div>
          ))
        ) : (
          <div className="flex h-[60px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
        )}
      </div>
    </Card>
  );
};
