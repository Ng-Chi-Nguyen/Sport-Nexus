import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import {
  formatDate,
  formatCurrency,
  formatFullDateTime,
} from "@/utils/formatters";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";

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

const PurchaseOrderPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(responses);
  const purchases = responses.data.purchaseOrders;
  console.log(purchases);

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
          <SearchTable placeholder="Tìm kiếm chi tiết sản phẩm..." />
        </div>
        <BtnAdd
          route={"/management/purchase/create"}
          className="w-[30%]"
          name="Thêm đơn nhập hàng"
        />
      </div>
      <h2 className="my-3">Danh sách nhập hàng</h2>
      <div className="relative bg-white mt-2">
        <table className="w-full text-sm text-left text-[#323232] table-retro">
          <thead className="text-sm uppercase bg-primary border-b-2 text-[#fff] border-[#323232]">
            <tr>
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
                        route={`/management/product-variants/edit/${purchase.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        // onClick={() =>
                        //   openConfirm(purchase.id, purchase.product.name)
                        // }
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-gray-400 italic"
                >
                  Không có biến thể nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="py-4 border-t-2 border-[#323232] bg-[#f8f9fa]">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        {/* <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa biến thể sản phẩm"
          message={`Bạn đang thực hiện xóa biến thể sản phẩm "${deleteTarget.name}".`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        /> */}
      </div>
    </>
  );
};

export default PurchaseOrderPage;
