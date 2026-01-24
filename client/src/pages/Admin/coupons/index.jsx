import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge"; // Đảm bảo bạn đã import Badge
import { LayoutDashboard, Ticket } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { formatDate } from "@/utils/formatters";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { useState } from "react";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import couponApi from "@/api/management/couponApi";

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

  const coupons = responses?.data?.list_coupons || [];

  const pagination = responses?.data?.pagination;
  // console.log(coupons);
  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const openConfirm = (categoryId) => {
    setDeleteTarget(categoryId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await couponApi.delete(deleteTarget); // Gọi API xóa
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["coupons"] });
        revalidator.revalidate(); // Cập nhật UI
        toast.success(response.message);
        setIsConfirmOpen(false); // Đóng modal
      }
    } catch (error) {
      // 1. Log để kiểm tra cấu trúc lỗi thực tế trong Console
      console.log("Cấu trúc error nhận được:", error);
      setIsConfirmOpen(false);
      // 2. Lấy thông báo lỗi linh hoạt
      // Nếu có Interceptor: dùng error.message
      // Nếu không có Interceptor: dùng error.response?.data?.message
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm mã khuyến mãi..." />
        </div>
        <BtnAdd
          route={"/management/coupons/create"}
          className="w-[200px]"
          name="Thêm khuyến mãi"
        />
      </div>

      <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left table-retro text-[#323232]">
          <thead className="text-xs uppercase bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black text-center">Mã Code</th>
              <th className="px-6 py-4 font-black text-center">Hiệu lực</th>
              <th className="px-6 py-4 font-black text-center">Giới hạn đơn</th>
              <th className="px-6 py-4 font-black text-center">Sử dụng</th>
              <th className="px-6 py-4 font-black text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="hover:bg-blue-50/30 transition-colors duration-200"
                >
                  {/* Mã Code */}
                  <td className="px-6 py-4 text-center font-bold text-blue-600">
                    <Badge color={coupon.is_active ? "blue" : "red"}>
                      {coupon.code} {coupon.is_active ? "" : ""}
                    </Badge>
                    <div className="flex items-center justify-center gap-1">
                      <div className="font-bold text-[12px]">
                        {coupon.discount_type === "CASH"
                          ? "Giảm tiền mặt"
                          : "Giảm phần trăm"}
                      </div>
                      <div className="text-xs text-emerald-600 font-black">
                        {coupon.discount_type === "CASH"
                          ? formatCurrency(coupon.discount_value)
                          : `${coupon.discount_value}%`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[12px]">
                    <div className="text-slate-500">
                      Từ: {formatDate(coupon.start_date)}
                    </div>
                    <div className="text-rose-500 font-medium">
                      Đến: {formatDate(coupon.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[12px]">
                    <div className="text-slate-500 italic">
                      Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}
                    </div>
                    <div className="font-bold text-slate-700">
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
                  colSpan="7"
                  className="px-6 py-10 text-center text-gray-400 italic"
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
          message={`Bạn đang thực hiện xóa mã giảm giá".`}
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
