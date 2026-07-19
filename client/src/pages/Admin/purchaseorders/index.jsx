import { useState, useEffect, useRef } from "react";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { SimpleSelect } from "@/components/ui/select";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard, Filter, ChevronDown } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import {
  formatDate,
  formatCurrency,
  formatFullDateTime,
} from "@/utils/formatters";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/ui/confirm";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuổi cung ứng", route: "" },
  { title: "Nhập hàng", route: "" },
];

const getStatusDetails = (status) => {
  switch (status) {
    case "PENDING":
      return { color: "warning", label: "Đang chờ" };
    case "RECEIVED":
      return { color: "success", label: "Đã nhận" };
    case "PARTIALLY_RECEIVED":
      return { color: "info", label: "Nhận một phần" };
    case "CANCELLED":
      return { color: "error", label: "Đã hủy" };
    default:
      return { color: "default", label: status };
  }
};

const statusOptions = [
  { slug: "", name: "Tất cả" },
  { slug: "PENDING", name: "Đang chờ" },
  { slug: "RECEIVED", name: "Đã nhận" },
  { slug: "PARTIALLY_RECEIVED", name: "Nhận một phần" },
  { slug: "CANCELLED", name: "Đã hủy" },
];

const PurchaseOrderPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    id: "",
    name: "",
  });

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSupplierId = searchParams.get("supplier_id") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";
  const currentCostMin = searchParams.get("cost_min") || "";
  const currentCostMax = searchParams.get("cost_max") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters = currentStatus || currentSupplierId || currentDateFrom || currentDateTo || currentCostMin || currentCostMax;

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

  const purchases = responses.data?.purchaseOrders || [];

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const openConfirm = (purchaseId) => {
    setDeleteTarget({
      id: purchaseId,
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await purchaseOrderdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["purchase-order"],
        });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
      revalidator.revalidate();
      setIsConfirmOpen(false);
    } catch (error) {
      console.log("Cấu trúc error nhận được:", error);
      setIsConfirmOpen(false);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm mã đơn nhập hàng..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
            hasActiveFilters
              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
              : "bg-[#111827]/40 text-slate-400 border-slate-800 hover:bg-[#161F32] hover:text-slate-200"
          }`}
        >
          <Filter size={14} />
          Bộ lọc
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
          <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
        </button>
        <BtnAdd route={"/management/purchase/create"} name="Thêm đơn nhập hàng" />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {statusOptions.map((opt) => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => setFilter("status", opt.slug)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
              currentStatus === opt.slug
                ? "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_12px_rgba(14,165,233,0.1)]"
                : "bg-[#111827]/40 text-slate-400 border-slate-800 hover:bg-[#161F32] hover:text-slate-200"
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      <div className={`transition-all duration-300 ease-in-out ${
        showFilters ? "max-h-[500px] opacity-100 mb-4 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="p-4 bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg">
          <div className="flex items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-end">
            <SimpleSelect
              label="Nhà cung cấp"
              value={currentSupplierId}
              onChange={(val) => setFilter("supplier_id", val)}
              options={[
                { slug: "", name: "Tất cả" },
                ...(responses.suppliers || []).map((s) => ({ slug: String(s.id), name: s.name })),
              ]}
              placeholder="Tất cả"
            />

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ngày đặt hàng
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={currentDateFrom}
                  onChange={(e) => setFilter("date_from", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="date"
                  value={currentDateTo}
                  onChange={(e) => setFilter("date_to", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Tổng tiền
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={currentCostMin}
                  onChange={(e) => setFilter("cost_min", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={currentCostMax}
                  onChange={(e) => setFilter("cost_max", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
              </div>
            </div>

            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-10 shrink-0 px-3 text-xs font-bold rounded-lg border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      <h2 className="my-3">Danh sách nhập hàng</h2>
      <div className="table-retro">
        <table className="w-full text-sm text-left text-[#323232] table-retro">
          <thead className="text-sm uppercase bg-primary border-b-2 text-[#fff] border-[#323232]">
            <tr>
              <th>Mã nhập hàng</th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Ngày đặt hàng
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Ngày nhận hàng dự kiến
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Giá (Vnđ)
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Số lượng món hàng
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((purchase, index) => (
                <tr
                  key={purchase.id || index}
                  className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                >
                  <td className="text-center font-bold">
                    <p className="text-blue-700 text-[18px]">
                      #PO-{purchase.id}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-[#323232] text-center">
                    {formatFullDateTime(purchase.order_date)}
                  </td>
                  <td className="p-4 font-bold text-[#323232] text-center">
                    {formatDate(purchase.expected_delivery_date)}
                  </td>
                  <td className="p-4 font-bold text-red-500 font-bold text-center">
                    {formatCurrency(purchase.total_cost)}
                  </td>
                  <td className="p-4 font-bold text-[#323232] text-center">
                    <Badge color="blue">
                      {purchase.PurchaseOrderItems.length} món
                    </Badge>
                  </td>
                  <td className="p-4 font-bold text-[#323232] text-center">
                    <Badge color={getStatusDetails(purchase.status).color}>
                      {getStatusDetails(purchase.status).label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <BtnEdit
                        route={`/management/purchase/edit/${purchase.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() => openConfirm(purchase.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-gray-400 italic"
                >
                  Không có đơn nhập hàng nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t-2 border-[#323232] bg-[#f8f9fa]">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa đơn hàng"
          message="Bạn đang thực hiện xóa đơn hàng."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
