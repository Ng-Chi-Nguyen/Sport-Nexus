import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SearchTable } from "@/components/ui/search";
import { BtnDelete, BtnEdit, BtnAdd } from "@/components/ui/button";
import {
  Box,
  LayoutDashboard,
  LockOpen,
  Menu,
  PackageCheck,
  PackageX,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import Badge from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý sản phẩm & kho",
    route: "",
  },
  {
    title: "Sản phẩm",
    route: "",
  },
];

const ProductPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const products = responses.data.list_products;

  const openConfirm = (productId) => {
    setDeleteTarget(productId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    // try {
    //   const response = await permissionApi.delete(deleteTarget);
    //   if (response.success) {
    //     await queryClient.invalidateQueries({ queryKey: ["permissions"] });
    //     revalidator.revalidate(); // Cập nhật UI
    //     toast.success(response.message);
    //     setIsConfirmOpen(false); // Đóng modal
    //   }
    //   revalidator.revalidate(); // Cập nhật UI
    //   setIsConfirmOpen(false); // Đóng modal
    // } catch (error) {
    //   console.log("Cấu trúc error nhận được:", error);
    //   setIsConfirmOpen(false);
    //   const errorMessage =
    //     error.message ||
    //     error.response?.data?.message ||
    //     error.response?.data?.errors?.[0] ||
    //     "Đã có lỗi xảy ra!";
    //   toast.error(errorMessage);
    // }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  console.log(responses);
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm sản phẩm..." />
        </div>
        <BtnAdd
          route={"/management/products/create"}
          className="w-[30%]"
          name="Thêm nhà cung cấp"
        />
      </div>
      <h2 className="mt-4">Danh sách sản phẩm</h2>
      <div className="relative bg-white mt-2">
        <table className="w-full text-sm text-left text-[#323232] table-retro">
          <thead className="text-sm uppercase bg-primary border-b-2 text-[#fff] border-[#323232]">
            <tr>
              <th scope="col" className="px-6 py-4 font-black text-start">
                Thông tin sản phẩm
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Thông tin phân loại
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
            {products.length > 0 ? (
              products.map((product, index) => (
                <tr
                  key={product.id || index}
                  className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                >
                  <td className="flex items-center p-2 font-bold text-[#323232] whitespace-nowrap">
                    <div className="w-[60px] h-[60px] border border-gray-200 rounded overflow-hidden bg-gray-50">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="ml-2 flex-1 min-w-0">
                      <p className="font-black text-sm text-[#323232] truncate">
                        {product.name}
                      </p>
                      <Badge color="blue">
                        <span className="mr-2">Loại hàng: </span>
                        <p className="font-bold">{product.category.name}</p>
                      </Badge>
                      <p className="text-[12px] text-gray-500">
                        Giá gốc:
                        <span className="text-green-400">
                          {product.base_price}
                        </span>
                        (vnđ)
                      </p>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="flex flex-col items-center justify-center gap-1 my-1">
                      <Badge color="purple">
                        <span className="mr-2">Thượng hiệu: </span>
                        <p className="font-bold">{product.brand.name}</p>
                      </Badge>

                      <Badge color="pink">
                        <span className="mr-2">Nhà cung cấp: </span>
                        <p>{product.supplier.name}</p>
                      </Badge>
                    </div>
                  </td>
                  <td className="text-center">
                    {product.is_active ? (
                      <Badge color="green">
                        <PackageCheck /> <span className="ml-2">Còn hàng</span>
                      </Badge>
                    ) : (
                      <Badge color="red">
                        <PackageX />
                        <span className="ml-2">Hết hàng</span>
                      </Badge>
                    )}
                  </td>
                  <td className="">
                    <div className="flex gap-3 justify-center">
                      <BtnEdit
                        route={`/management/product/edit/${product.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() => openConfirm(product.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-3 text-center text-gray-400 italic"
                >
                  Không có sản phẩm nào
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
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa sản phẩm"
          message={`Bạn đang thực hiện xóa sản phẩm "${deleteTarget}".`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default ProductPage;
