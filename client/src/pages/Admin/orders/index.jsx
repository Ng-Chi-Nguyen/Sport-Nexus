import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import { formatFullDateTime, formatCurrency } from "@/utils/formatters";

// IMPORT các hằng số từ file constants.js cùng cấp
import {
  DROPDOWN_SELECT_CLASS,
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

// --- HÀM BỔ TRỢ (UTILITIES) VỀ MÀU SẮC GIỮ LẠI ---
const getOrderStatusClass = (status) => {
  const styles = {
    Processing: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    Shipping: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

const getPaymentStatusClass = (status) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-400/20";
};

// --- COMPONENT CHÍNH ---
const OrderPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const orders = responses?.data?.orders || [];

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

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM TÍCH HỢP SUBMIT TRONG Ô NHẬP */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <SearchTable
            placeholder="Tìm mã đơn hàng, email khách hàng..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
        </form>
        <BtnAdd route={"/management/orders/create"} name="Tạo đơn hàng" />
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 bg-[#0D121F]/40 border border-slate-900 rounded-2xl shadow-md w-full">
        {/* Dropdown Vận chuyển */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Vận chuyển
          </label>
          <select
            value={currentStatus}
            onChange={(e) =>
              handleDropdownFilterChange("status", e.target.value)
            }
            className={DROPDOWN_SELECT_CLASS}
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Thanh toán */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Thanh toán
          </label>
          <select
            value={currentPaymentStatus}
            onChange={(e) =>
              handleDropdownFilterChange("payment_status", e.target.value)
            }
            className={DROPDOWN_SELECT_CLASS}
          >
            <option value="">Tất cả trạng thái</option>
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Phương thức */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Phương thức
          </label>
          <select
            value={currentPaymentMethod}
            onChange={(e) =>
              handleDropdownFilterChange("payment_method", e.target.value)
            }
            className={DROPDOWN_SELECT_CLASS}
          >
            <option value="">Tất cả phương thức</option>
            {METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc thời gian ngày bắt đầu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Từ ngày
          </label>
          <input
            type="date"
            value={currentDateFrom}
            onChange={(e) =>
              handleDropdownFilterChange("date_from", e.target.value)
            }
            className="px-3 py-1.5 rounded-xl text-xs bg-[#111827]/80 text-slate-300 border border-slate-800/80 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 transition-all duration-150 cursor-pointer"
          />
        </div>

        {/* Lọc thời gian ngày kết thúc */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Đến ngày
          </label>
          <input
            type="date"
            value={currentDateTo}
            onChange={(e) =>
              handleDropdownFilterChange("date_to", e.target.value)
            }
            className="px-3 py-1.5 rounded-xl text-xs bg-[#111827]/80 text-slate-300 border border-slate-800/80 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 transition-all duration-150 cursor-pointer"
          />
        </div>

        {/* Lọc giá trị đơn hàng tối thiểu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Giá trị tối thiểu
          </label>
          <input
            type="number"
            placeholder="Từ (đ)"
            value={currentAmountMin}
            onChange={(e) =>
              handleDropdownFilterChange("amount_min", e.target.value)
            }
            className="px-3 py-1.5 rounded-xl text-xs bg-[#111827]/80 text-slate-300 border border-slate-800/80 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 transition-all duration-150 w-28 font-mono"
          />
        </div>

        {/* Lọc giá trị đơn hàng tối đa */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Giá trị tối đa
          </label>
          <input
            type="number"
            placeholder="Đến (đ)"
            value={currentAmountMax}
            onChange={(e) =>
              handleDropdownFilterChange("amount_max", e.target.value)
            }
            className="px-3 py-1.5 rounded-xl text-xs bg-[#111827]/80 text-slate-300 border border-slate-800/80 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 transition-all duration-150 w-28 font-mono"
          />
        </div>
      </div>

      {/* KHỐI BẢNG CONTAINER TỐI CHỦ ĐẠO */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
          Danh sách đơn hàng
        </h2>

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
