import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useSearchParams } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
// utils
import { formatCurrency } from "@/utils/formatters";
import { BtnActions } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { formatFullDateTime } from "@/utils/formatters";
import Pagination from "@/components/ui/pagination";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
];

const STATUS_COLORS = {
  Processing: "blue", // Chuẩn bị hàng
  Shipping: "warning", // Đang giao (dùng màu amber bạn định nghĩa)
  Delivered: "success", // Đã giao (dùng màu emerald)
  Cancelled: "error", // Đã hủy (dùng màu rose)
  Refunded: "purple", // Hoàn tiền
};

const STATUS_LABELS = {
  Processing: "Chuẩn bị hàng",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
  Refunded: "Hoàn tiền",
};

const STATUS_PAYMENT = {
  Pending: "Chờ thanh toán",
  Paid: "Đã trả",
  Failed: "Thất bại",
  Refunded: "Hoàn tiền",
};

const OrderPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const orders = responses?.data?.orders || []; // Truy xuất đúng cấu trúc data

  // console.log(orders);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm mã đơn hàng, email..." />
        </div>
        <BtnAdd
          route={"/management/orders/create"}
          className="w-[200px]"
          name="Tạo đơn hàng"
        />
      </div>
      <h2 className="py-2">Danh sách đơn hàng</h2>
      <table className="table-retro">
        <thead>
          <tr>
            <th className="p-4 !text-left">Thông tin khách hàng</th>
            <th className="p-4">Tiền</th>
            <th className="p-4">Thông tin đơn hàng</th>
            <th className="p-4">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="text-sm text-slate-600 py-2 pl-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      Email:
                    </span>
                    <span className="font-medium">
                      {order.user_email || "Khách tại cửa hàng"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      Địa chỉ:
                    </span>
                    <span className="truncate max-w-[200px] text-xs">
                      {order.shipping_address}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Phương thức thanh toán:
                    <span className="text-[10px] bg-lime-50 text-lime-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      {order.payment_method}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      {STATUS_PAYMENT[order.payment_status]}
                    </span>
                  </div>
                </div>
              </td>
              <td className="">
                <div className="flex flex-col items-center gap-1">
                  <Badge color="slate" className="scale-90 opacity-60">
                    Gốc: {formatCurrency(order.total_amount)}
                  </Badge>
                  {Number(order.discount_amount) > 0 && (
                    <Badge color="red" className="scale-90">
                      Giảm: -{formatCurrency(order.discount_amount)}
                    </Badge>
                  )}
                  <Badge
                    color="success"
                    className="font-bold border border-emerald-200"
                  >
                    Tổng: {formatCurrency(order.final_amount)}
                  </Badge>
                </div>
              </td>

              <td className="text-center">
                <div className="text-xs text-slate-500 leading-relaxed">
                  <div className="font-medium text-slate-700">
                    <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      Ngày mua:
                    </span>
                    {formatFullDateTime(order.created_at)}
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    Trạng thái:
                  </span>
                  <Badge
                    color={STATUS_COLORS[order.status]}
                    className="px-3 py-1.5 shadow-sm"
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </Badge>
                  <div className="">
                    <span className="text-[10px] bg-fuchsia-50 text-fuchsia-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      Mã giảm giá:
                    </span>
                    <Badge color="indigo">
                      {order.coupon_code || "Không có"}
                    </Badge>
                  </div>
                </div>
              </td>

              <td className="text-center">
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

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="p-20 text-center text-slate-400 text-sm">
          Chưa có đơn hàng nào được tạo.
        </div>
      )}
      <Pagination
        totalPages={paginationInfo.totalPages}
        currentPage={paginationInfo.currentPage}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default OrderPage;
