import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { LayoutDashboard, ChevronDown, Filter, RefreshCw } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import couponApi from "@/api/management/couponApi";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";

// Import component SimpleSelect mới từ thư mục chứa ui components của bạn
import { SimpleSelect } from "@/components/ui/select";
import {
  ACTIVE_TABS,
  DISCOUNT_TYPE_OPTIONS,
} from "@/constants/management/coupon";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
    setTimeout(() => revalidator.revalidate(), 0);
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
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="flex flex-wrap items-center gap-3 my-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
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
              ? "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20"
              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:bg-[#111827]/40 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-[#161F32] dark:hover:text-slate-200"
          }`}
        >
          <Filter size={14} />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        <ExcelCrudActions
          basePath="/management/coupon"
          title="Import / Export mã giảm giá"
          templateFileName="template-ma-giam-gia.xlsx"
          exportFileName="ma-giam-gia.xlsx"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            revalidator.revalidate();
          }}
        />
        <BtnAdd route="/management/coupons/create" name="Thêm khuyến mãi" />
      </div>

      {/* KHU VỰC BỘ LỌC NGANG */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-[500px] opacity-100 mb-4 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 rounded-xl border shadow-lg transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/80 dark:border-slate-800">
          <div className="flex flex-wrap items-end gap-4">
            {/* 1. Trạng thái */}
            <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[230px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Trạng thái
              </label>
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg h-10 border transition-colors duration-200 bg-slate-100 border-slate-200 dark:bg-[#111827]/60 dark:border-slate-800">
                {ACTIVE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilter("is_active", tab.value)}
                    className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
                      isActive === tab.value
                        ? "bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Loại giảm giá */}
            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label="Loại giảm giá"
                options={DISCOUNT_TYPE_OPTIONS}
                value={discountType}
                onChange={(val) => setFilter("discount_type", val)}
                placeholder="Tất cả"
              />
            </div>

            {/* 3. Từ ngày */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setFilter("date_from", e.target.value)}
                className="w-full h-10 px-2.5 text-sm rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:ring-1 dark:focus:ring-sky-500/20"
              />
            </div>

            {/* 4. Đến ngày */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setFilter("date_to", e.target.value)}
                className="w-full h-10 px-2.5 text-sm rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:ring-1 dark:focus:ring-sky-500/20"
              />
            </div>

            {/* 5. Giá trị giảm */}
            <div className="w-[180px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Giá trị giảm
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={discountMin}
                  onChange={(e) => setFilter("discount_min", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50"
                />
                <span className="text-slate-400 dark:text-slate-600 shrink-0">
                  –
                </span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={discountMax}
                  onChange={(e) => setFilter("discount_max", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50"
                />
              </div>
            </div>

            {/* 6. Nút Xóa bộ lọc */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-10 shrink-0 px-3 text-xs font-bold rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TIÊU ĐỀ & NÚT REFRESH */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Danh sách mã giảm giá
        </h2>
        <button
          onClick={handleRefresh}
          disabled={revalidator.state === "loading"}
          className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Tải lại"
        >
          <RefreshCw
            size={18}
            className={revalidator.state === "loading" ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* KHỐI BẢNG CONTAINER */}
      <div className="mt-3 relative rounded-2xl shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/80 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-800 dark:text-slate-200 min-w-[600px]">
            <thead className="text-xs uppercase border-b transition-colors duration-200 bg-slate-100 border-slate-200 dark:bg-[#161F32] dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  Mã Code
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  Hiệu lực
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  Giới hạn đơn
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  Sử dụng
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#161F32]/40 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-center font-bold text-sky-600 dark:text-sky-400">
                      <Badge color={coupon.is_active ? "blue" : "red"}>
                        Code: {coupon.code}
                      </Badge>
                      {!coupon.is_active && (
                        <div className="mt-1">
                          <Badge color="red">Đã hết hạn</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <span className="font-bold text-[12px] text-slate-600 dark:text-slate-300">
                          {coupon.discount_type === "CASH"
                            ? "Giảm tiền mặt"
                            : "Giảm phần trăm"}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {coupon.discount_type === "CASH"
                            ? formatCurrency(coupon.discount_value)
                            : `${coupon.discount_value}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[12px]">
                      <div className="text-slate-500 dark:text-slate-400">
                        Từ: {formatDate(coupon.start_date)}
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 font-medium">
                        Đến: {formatDate(coupon.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[12px]">
                      <div className="text-slate-500 dark:text-slate-400 italic">
                        Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Giảm tối đa: {formatCurrency(coupon.max_discount)}
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
                    className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 italic"
                  >
                    Không tìm thấy mã khuyến mãi nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa mã giảm giá"
          message="Bạn đang thực hiện xóa mã giảm giá."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CouponPage;
