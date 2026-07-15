import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useSearchParams } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import { formatFullDateTime, formatCurrency } from "@/utils/formatters";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
];

// Hàm sinh class màu neon mờ phát sáng cho trạng thái đơn hàng
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

const STATUS_LABELS = {
  Processing: "Chuẩn bị hàng",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
  Refunded: "Hoàn tiền",
};

// Hàm sinh class màu cho trạng thái thanh toán
const getPaymentStatusClass = (status) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-400/20";
};

const STATUS_PAYMENT = {
  Pending: "Chờ thanh toán",
  Paid: "Đã thanh toán",
  Failed: "Thất bại",
  Refunded: "Hoàn tiền",
};

const OrderPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const orders = responses?.data?.orders || [];

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm mã đơn hàng, email khách hàng..." />
        </div>
        <BtnAdd route={"/management/orders/create"} name="Tạo đơn hàng" />
      </div>

      {/* KHỐI CONTAINER TỐI CHỦ ĐẠO */}
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
                    {/* CỘT 1: THÔNG TIN KHÁCH HÀNG & PHƯƠNG THỨC */}
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
                            {STATUS_PAYMENT[order.payment_status]}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CỘT 2: DÒNG TIỀN */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center justify-center gap-2 w-full">
                        {/* Tiền gốc */}
                        <div className="flex items-center gap-2 w-fit">
                          <Badge color="slate">Gốc</Badge>
                          <span className="text-xs font-mono text-slate-400 line-through tracking-wide">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>

                        {/* Tiền giảm */}
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

                        {/* Tiền thực thu */}
                        <div className="flex items-center gap-2 w-fit mt-0.5">
                          <Badge color="success">Thực thu</Badge>
                          <span className="text-sm font-black font-mono text-emerald-400 tracking-wide bg-emerald-500/5 px-2.5 py-0.5 rounded-lg border border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                            {formatCurrency(order.final_amount)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CỘT 3: TRẠNG THÁI ĐƠN HÀNG & MÃ COUPON */}
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

                    {/* CỘT 4: THAO TÁC */}
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

        {/* Empty State */}
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
