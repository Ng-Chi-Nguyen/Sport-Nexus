import { LayoutDashboard, ChevronDown, Filter, RefreshCw } from "lucide-react";
import { useLoaderData, useSearchParams, useRevalidator } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { queryClient } from "@/lib/react-query";
import { SearchTable } from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import { formatFullDateTime, formatCurrency } from "@/utils/formatters";
import { SimpleSelect } from "@/components/ui/select";

// IMPORT các hằng số từ file constants.js cùng cấp
import {
  STATUS_LABELS,
  STATUS_PAYMENT,
  STATUS_OPTIONS,
  PAYMENT_OPTIONS,
  METHOD_OPTIONS,
} from "@/constants/order";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
];

import { getOrderStatusClass, getPaymentStatusClass } from "@/utils/statusStyles";

// --- COMPONENT CHÍNH ---
const OrderPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const orders = responses?.data?.orders || [];

  const [showFilters, setShowFilters] = useState(false);

  // Đọc dữ liệu từ URL params
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentPaymentStatus = searchParams.get("payment_status") || "";
  const currentPaymentMethod = searchParams.get("payment_method") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";
  const currentAmountMin = searchParams.get("amount_min") || "";
  const currentAmountMax = searchParams.get("amount_max") || "";

  // State tạm giữ từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const hasActiveFilters =
    currentStatus ||
    currentPaymentStatus ||
    currentPaymentMethod ||
    currentDateFrom ||
    currentDateTo ||
    currentAmountMin ||
    currentAmountMax;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (searchTerm.trim()) params.set("search", searchTerm);
    else params.delete("search");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const handleDropdownFilterChange = (field, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set(field, value);
    else params.delete(field);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  // Chuyển đổi định dạng danh sách options từ label/value sang slug/name cho SimpleSelect
  const statusOptionsMapped = useMemo(
    () => STATUS_OPTIONS.map((opt) => ({ slug: opt.value, name: opt.label })),
    [],
  );

  const paymentOptionsMapped = useMemo(
    () => PAYMENT_OPTIONS.map((opt) => ({ slug: opt.value, name: opt.label })),
    [],
  );

  const methodOptionsMapped = useMemo(
    () => METHOD_OPTIONS.map((opt) => ({ slug: opt.value, name: opt.label })),
    [],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM TÍCH HỢP NÚT BỘ LỌC CỦA COUPON */}
      <div className="flex items-center gap-3 my-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <SearchTable
            placeholder="Tìm mã đơn hàng, email khách hàng..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
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

        <BtnAdd route={"/management/orders/create"} name="Tạo đơn hàng" />
      </div>

      {/* KHU VỰC CÁC Ô LỌC HÀNG NGANG FLEXBOX AN TOÀN TRÁNH ẨN DROP-DOWN */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-[500px] opacity-100 mb-4 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg">
          <div className="flex flex-wrap items-end gap-4">
            {/* 1. Dropdown Vận chuyển */}
            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label="Vận chuyển"
                options={statusOptionsMapped}
                value={currentStatus}
                onChange={(val) => handleDropdownFilterChange("status", val)}
                placeholder="Tất cả trạng thái"
              />
            </div>

            {/* 2. Dropdown Thanh toán */}
            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label="Thanh toán"
                options={paymentOptionsMapped}
                value={currentPaymentStatus}
                onChange={(val) =>
                  handleDropdownFilterChange("payment_status", val)
                }
                placeholder="Tất cả trạng thái"
              />
            </div>

            {/* 3. Dropdown Phương thức */}
            <div className="flex-1 min-w-[160px]">
              <SimpleSelect
                label="Phương thức"
                options={methodOptionsMapped}
                value={currentPaymentMethod}
                onChange={(val) =>
                  handleDropdownFilterChange("payment_method", val)
                }
                placeholder="Tất cả phương thức"
              />
            </div>

            {/* 4. Lọc thời gian ngày bắt đầu */}
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Từ ngày
              </label>
              <input
                type="date"
                value={currentDateFrom}
                onChange={(e) =>
                  handleDropdownFilterChange("date_from", e.target.value)
                }
                className="w-full h-10 px-2.5 text-sm rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 [color-scheme:dark]"
              />
            </div>

            {/* 5. Lọc thời gian ngày kết thúc */}
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Đến ngày
              </label>
              <input
                type="date"
                value={currentDateTo}
                onChange={(e) =>
                  handleDropdownFilterChange("date_to", e.target.value)
                }
                className="w-full h-10 px-2.5 text-sm rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 [color-scheme:dark]"
              />
            </div>

            {/* 6. Lọc khoảng giá trị đơn hàng */}
            <div className="w-[180px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Giá trị đơn hàng
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Từ (đ)"
                  value={currentAmountMin}
                  onChange={(e) =>
                    handleDropdownFilterChange("amount_min", e.target.value)
                  }
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600 font-mono"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Đến (đ)"
                  value={currentAmountMax}
                  onChange={(e) =>
                    handleDropdownFilterChange("amount_max", e.target.value)
                  }
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600 font-mono"
                />
              </div>
            </div>

            {/* 7. Nút Xóa bộ lọc nhỏ gọn cùng hàng ngang */}
            <div className="h-10 flex items-center shrink-0 ml-auto">
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1 text-[10px] font-bold rounded border border-slate-800 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI BẢNG CONTAINER TỐI CHỦ ĐẠO */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            Danh sách đơn hàng
          </h2>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tải lại"
          >
            <RefreshCw size={18} className={revalidator.state === "loading" ? "animate-spin" : ""} />
          </button>
        </div>

        {/* BẢNG ĐƠN HÀNG */}
        <div className="table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 w-[32%] !text-start">
                  Thông tin khách hàng
                </th>
                <th scope="col" className="px-6 py-4 w-[28%] text-center">
                  Giá trị đơn
                </th>
                <th scope="col" className="px-6 py-4 w-[28%] !text-start">
                  Trạng thái & Thời gian
                </th>
                <th scope="col" className="px-6 py-4 w-[12%] text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 &&
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Badge color="nexus">Email</Badge>
                          <span className="font-semibold text-slate-200 text-sm tracking-wide">
                            {order.user_email || "Khách tại cửa hàng"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Badge color="nexus">Địa chỉ</Badge>
                          <span
                            className="truncate max-w-[240px] text-xs text-slate-400"
                            title={order.shipping_address}
                          >
                            {order.shipping_address || "Nhận tại cửa hàng"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                          <Badge color="nexus">Thanh toán</Badge>
                          <span className="text-slate-300 font-medium font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60">
                            {order.payment_method}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPaymentStatusClass(order.payment_status)}`}
                          >
                            {STATUS_PAYMENT[order.payment_status] ||
                              order.payment_status}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center justify-center gap-2 w-full">
                        <div className="flex items-center gap-2 w-fit">
                          <Badge color="slate">Gốc</Badge>
                          <span className="text-xs font-mono text-slate-400 line-through tracking-wide">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        {Number(order.discount_amount) > 0 ? (
                          <div className="flex items-center gap-2 w-fit">
                            <Badge color="error">Giảm</Badge>
                            <span className="text-xs font-mono font-bold text-rose-400">
                              -{formatCurrency(order.discount_amount)}
                            </span>
                          </div>
                        ) : (
                          <div className="h-[20px]"></div>
                        )}
                        <div className="flex items-center gap-2 w-fit mt-0.5">
                          <Badge color="success">Thực thu</Badge>
                          <span className="text-sm font-black font-mono text-emerald-400 tracking-wide bg-emerald-500/5 px-2.5 py-0.5 rounded-lg border border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                            {formatCurrency(order.final_amount)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge color="nexus">Lịch sử</Badge>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {formatFullDateTime(order.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge color="nexus">Vận chuyển</Badge>
                          <span
                            className={`inline-flex items-center justify-center min-w-[90px] px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border ${getOrderStatusClass(order.status)}`}
                          >
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge color="nexus">Khuyến mãi</Badge>
                          {order.coupon_code ? (
                            <span className="text-[11px] font-mono font-semibold text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">
                              {order.coupon_code}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic text-[11px]">
                              Không áp dụng
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <BtnActions
                        id={order.id}
                        route={`/management/orders/edit/${order.id}`}
                        onDelete={(id) => console.log("Xóa đơn hàng:", id)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Trạng thái trống */}
        {orders.length === 0 && (
          <div className="py-20 text-center text-slate-500 italic text-sm">
            Chưa có đơn hàng nào được khởi tạo trên hệ thống.
          </div>
        )}

        {/* PHÂN TRANG */}
        <div className="mt-6">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
