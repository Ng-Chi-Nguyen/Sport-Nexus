import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Building2, Package, ShoppingCart, DollarSign } from "lucide-react";
import { Loader } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const SITEMS = [
  { key: "totalSuppliers", label: "Tổng NCC", icon: <Building2 size={16} />, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "totalPurchaseOrders", label: "Đơn nhập", icon: <ShoppingCart size={16} />, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "totalPurchaseCost", label: "Tổng chi", icon: <DollarSign size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10", fmt: (v) => formatCurrency(v) },
];

const SummaryCards = ({ summary = {} }) => (
  <div className="grid gap-3 sm:grid-cols-3 items-start">
    {SITEMS.map((item) => (
      <Card key={item.key}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>{item.icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.fmt ? item.fmt(summary[item.key]) : summary[item.key] ?? 0}</p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const SupplierTable = ({ data = [] }) => (
  <Card title="Danh sách nhà cung cấp" icon={<Building2 size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-2 font-medium">Tên NCC</th>
              <th className="pb-2 pr-2 font-medium">Người liên hệ</th>
              <th className="pb-2 pr-2 font-medium text-right">Sản phẩm</th>
              <th className="pb-2 pr-2 font-medium text-right">Đơn nhập</th>
              <th className="pb-2 pr-2 font-medium text-right">Tổng chi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-b border-slate-900 last:border-0">
                <td className="py-2 pr-2 font-medium text-slate-200 truncate max-w-[200px]">{s.name}</td>
                <td className="py-2 pr-2 text-slate-400">{s.contact_person}</td>
                <td className="py-2 pr-2 text-right text-slate-300">{s.productCount}</td>
                <td className="py-2 pr-2 text-right text-slate-300">{s.orderCount}</td>
                <td className="py-2 pr-2 text-right font-semibold text-emerald-400">{formatCurrency(s.totalOrderCost)}</td>
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

export const SupplierOverview = () => {
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-supplier-overview"],
    queryFn: () => dashboardApi.getSupplierOverview(),
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
      <SupplierTable data={data.suppliers || []} />
    </div>
  );
};
