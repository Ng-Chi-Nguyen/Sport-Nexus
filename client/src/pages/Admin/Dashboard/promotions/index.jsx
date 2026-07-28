import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Gift, CheckCircle, XCircle, TicketCheck, Percent } from "lucide-react";
import { Loader } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const SITEMS = [
  { key: "totalCoupons", label: "Tổng mã", icon: <Gift size={16} />, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "activeCoupons", label: "Đang hoạt động", icon: <CheckCircle size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "inactiveCoupons", label: "Vô hiệu", icon: <XCircle size={16} />, color: "text-red-400", bg: "bg-red-500/10" },
  { key: "totalUsage", label: "Lượt sử dụng", icon: <TicketCheck size={16} />, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const SummaryCards = ({ summary = {} }) => (
  <div className="grid gap-3 sm:grid-cols-4 items-start">
    {SITEMS.map((item) => (
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

const CouponTable = ({ data = [] }) => (
  <Card title="Danh sách mã giảm giá" icon={<Percent size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-2 font-medium">Mã</th>
              <th className="pb-2 pr-2 font-medium">Giảm</th>
              <th className="pb-2 pr-2 font-medium text-right">Đã dùng</th>
              <th className="pb-2 pr-2 font-medium text-right">Còn lại</th>
              <th className="pb-2 pr-2 font-medium text-right">Tỉ lệ</th>
              <th className="pb-2 pr-2 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-b border-slate-900 last:border-0">
                <td className="py-2 pr-2 font-mono font-bold text-sky-400">{c.code}</td>
                <td className="py-2 pr-2 text-slate-200">
                  {c.discount_type === "PERCENTAGE" ? `${c.discount_value}%` : formatCurrency(c.discount_value)}
                  {c.max_discount ? ` (tối đa ${formatCurrency(c.max_discount)})` : ""}
                </td>
                <td className="py-2 pr-2 text-right text-slate-300">{c.usage_count}</td>
                <td className="py-2 pr-2 text-right text-slate-400">{c.remaining}</td>
                <td className="py-2 pr-2 text-right font-semibold text-slate-200">{c.usageRate}%</td>
                <td className="py-2 pr-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {c.is_active ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
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

export const CouponOverview = () => {
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-coupon-overview"],
    queryFn: () => dashboardApi.getCouponOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader size={20} className="animate-spin mr-2" />
        Đang tải dữ liệu...
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <CouponTable data={data.coupons || []} />
    </div>
  );
};
