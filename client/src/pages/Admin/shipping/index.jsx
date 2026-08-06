import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, RefreshCw, Truck, Search } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import { SimpleSelect } from "@/components/ui/select";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import shippingApi from "@/api/management/shippingApi";

const STATUS_OPTIONS = [
  { slug: "", name: "Tất cả trạng thái" },
  { slug: "RECEIVED", name: "Đã tiếp nhận" },
  { slug: "PICKED_UP", name: "Đã lấy hàng" },
  { slug: "IN_TRANSIT", name: "Đang vận chuyển" },
  { slug: "OUT_FOR_DELIVERY", name: "Đang giao" },
  { slug: "DELIVERED", name: "Đã giao" },
  { slug: "CANCELLED", name: "Đã huỷ" },
];

const STATUS_BADGE = {
  RECEIVED: "slate",
  PICKED_UP: "blue",
  IN_TRANSIT: "cyan",
  OUT_FOR_DELIVERY: "warning",
  DELIVERED: "success",
  CANCELLED: "red",
};

const ShippingPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { data: res, isLoading, refetch } = useQuery({
    queryKey: ["shipping", page, status, search],
    queryFn: () => shippingApi.getAll({ page, status, search: search || undefined }),
  });

  const shipments = res?.data?.shipments || [];
  const pagination = res?.data?.pagination || { totalPages: 1, currentPage: 1 };

  const handleSearch = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs
        data={[
          { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
          { title: "Vận đơn (mô phỏng GHN)", route: "/management/shipping" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tìm theo mã vận đơn, người nhận, SĐT..."
            className="w-full bg-transparent text-sm outline-none px-1 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
        <div className="w-44">
          <SimpleSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 rounded-lg text-sm font-medium cursor-pointer"
        >
          Tìm
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F1526]/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        {isLoading ? (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-12">
            Đang tải vận đơn...
          </p>
        ) : shipments.length === 0 ? (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-12">
            Chưa có vận đơn nào.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-3 font-medium">Mã vận đơn</th>
                <th className="p-3 font-medium">Người nhận</th>
                <th className="p-3 font-medium">Địa chỉ</th>
                <th className="p-3 font-medium">Phí ship</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium">Ngày tạo</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {shipments.map((s) => (
                <Row
                  key={s.id}
                  s={s}
                  expanded={expandedId === s.id}
                  onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

const Row = ({ s, expanded, onToggle }) => (
  <>
    <tr
      onClick={onToggle}
      className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors cursor-pointer"
    >
      <td className="p-3 font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
        {s.tracking_code}
      </td>
      <td className="p-3">
        <div className="font-medium">{s.recipient_name}</div>
        <div className="text-xs text-slate-400">{s.recipient_phone}</div>
      </td>
      <td className="p-3 text-xs text-slate-600 dark:text-slate-400 max-w-[220px] truncate">
        {s.detail_address}, {s.ward_name}, {s.province_name}
      </td>
      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
        {formatCurrency(s.total_fee)}
      </td>
      <td className="p-3">
        <Badge color={STATUS_BADGE[s.status] || "gray"}>{s.status}</Badge>
      </td>
      <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
        {formatFullDateTime(s.created_at)}
      </td>
      <td className="p-3 text-xs text-slate-400">{expanded ? "▲" : "▼"}</td>
    </tr>
    {expanded && (
      <tr className="bg-slate-50/60 dark:bg-[#0B101D]">
        <td colSpan={7} className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Info label="Dịch vụ" value={s.service_type} />
            <Info label="Khối lượng" value={`${s.weight_grams} g`} />
            <Info label="Phí COD" value={formatCurrency(s.cod_amount)} />
            <Info label="Tổng phí" value={formatCurrency(s.total_fee)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
            <Info label="Phí vận chuyển" value={formatCurrency(s.shipping_fee)} />
            <Info label="Phí COD" value={formatCurrency(s.cod_fee)} />
            <Info label="Phí bảo hiểm" value={formatCurrency(s.insurance_fee)} />
            <Info
              label="Giao dự kiến"
              value={formatFullDateTime(s.estimated_delivery)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Truck size={14} /> Timeline
          </div>
          <div className="mt-2 space-y-1">
            {(s.timeline || []).map((step, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400"
              >
                <span>{step.note}</span>
                <span className="text-slate-400 dark:text-slate-500">
                  {formatFullDateTime(step.time)}
                </span>
              </div>
            ))}
          </div>
        </td>
      </tr>
    )}
  </>
);

const Info = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {label}
    </div>
    <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
      {value || "—"}
    </div>
  </div>
);

export default ShippingPage;