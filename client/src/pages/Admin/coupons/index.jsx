import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { LayoutDashboard, ChevronDown, Filter } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { formatDate } from "@/utils/formatters";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import couponApi from "@/api/management/couponApi";

const ACTIVE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "true", label: "Còn hiệu lực" },
  { value: "false", label: "Hết hiệu lực" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "CASH", label: "Tiền mặt" },
  { value: "PERCENTAGE", label: "Phần trăm" },
];

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Khuyến mãi", route: "/management/coupons" },
];

const CouponPage = () => {
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const isActive = searchParams.get("is_active") || "";
  const discountType = searchParams.get("discount_type") || "";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";
  const discountMin = searchParams.get("discount_min") || "";
  const discountMax = searchParams.get("discount_max") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const coupons = responses?.data?.list_coupons || [];
  const pagination = responses?.data?.pagination || {};

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const hasActiveFilters =
    isActive ||
    discountType ||
    dateFrom ||
    dateTo ||
    discountMin ||
    discountMax;

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilter("search", searchTerm.trim() || "");
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

  const openConfirm = (id) => {
    setDeleteTarget(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await couponApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["coupons"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
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
    <>
      <Breadcrumbs data={breadcrumbData} />

      <div className="flex items-center gap-3 my-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <SearchTable
            placeholder="Tìm kiếm mã khuyến mãi..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </form>

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
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        <BtnAdd route="/management/coupons/create" name="Thêm khuyến mãi" />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Trạng thái
              </label>
              <div className="flex items-center gap-1 p-1 bg-[#111827]/60 border border-slate-800 rounded-lg">
                {ACTIVE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilter("is_active", tab.value)}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
                      isActive === tab.value
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Loại giảm giá
              </label>
              <div className="relative">
                <select
                  value={discountType}
                  onChange={(e) => setFilter("discount_type", e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg 
                    bg-[#111827]/80 text-slate-200 border border-slate-900/60 
                    outline-none focus:outline-none focus:border-sky-500/40 
                    focus:ring-1 focus:ring-sky-500/10 
                    shadow-sm focus:shadow-[0_0_12px_rgba(79,172,243,0.1)]
                    cursor-pointer hover:border-slate-800 transition-all duration-200"
                >
                  {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-[#0D121F] text-slate-200"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setFilter("date_from", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setFilter("date_to", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 [color-scheme:dark]"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Giá trị giảm
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={discountMin}
                  onChange={(e) => setFilter("discount_min", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={discountMax}
                  onChange={(e) => setFilter("discount_max", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-100">
        Danh sách mã giảm giá
      </h2>
      <div className="mt-3 relative bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm text-left text-slate-200">
          <thead className="text-xs uppercase bg-[#161F32] border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Mã Code
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Hiệu lực
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Giới hạn đơn
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Sử dụng
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="hover:bg-[#161F32]/40 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-center font-bold text-sky-400">
                    <Badge color={coupon.is_active ? "blue" : "red"}>
                      Code: {coupon.code}
                    </Badge>
                    {!coupon.is_active && <Badge color="red">Đã hết hạn</Badge>}
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="font-bold text-[12px] text-slate-300">
                        {coupon.discount_type === "CASH"
                          ? "Giảm tiền mặt"
                          : "Giảm phần trăm"}
                      </span>
                      <span className="text-xs text-emerald-400 font-black">
                        {coupon.discount_type === "CASH"
                          ? formatCurrency(coupon.discount_value)
                          : `${coupon.discount_value}%`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[12px]">
                    <div className="text-slate-400">
                      Từ: {formatDate(coupon.start_date)}
                    </div>
                    <div className="text-rose-400 font-medium">
                      Đến: {formatDate(coupon.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[12px]">
                    <div className="text-slate-400 italic">
                      Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}
                    </div>
                    <div className="font-bold text-slate-200">
                      Tối đa: {formatCurrency(coupon.max_discount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge color="green">
                      {coupon.usage_count} / {coupon.usage_limit}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <BtnEdit
                        route={`/management/coupons/edit/${coupon.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() => openConfirm(coupon.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-slate-500 italic"
                >
                  Không tìm thấy mã khuyến mãi nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa mã giảm giá"
          message="Bạn đang thực hiện xóa mã giảm giá."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
        <Pagination
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default CouponPage;
