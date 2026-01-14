import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { LayoutDashboard, PackageCheck, PackageX } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import Pagination from "@/components/ui/pagination";
import { useState } from "react";
import { ConfirmDelete } from "@/components/ui/confirm";
import { queryClient } from "@/lib/react-query";
import productVariantdApi from "@/api/core/productVariantApi";
import { toast } from "sonner";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Biến thể sản phẩm", route: "#" },
];

const variantVariant = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    id: "",
    name: "",
  });

  const variants = responses.data.variants;
  console.log(responses);
  console.log(variants);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const openConfirm = (productId, name) => {
    // console.log(productId);
    // console.log(name);
    setDeleteTarget({
      id: productId,
      name: name,
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await productVariantdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        revalidator.revalidate(); // Cập nhật UI
        toast.success(response.message);
        setIsConfirmOpen(false); // Đóng modal
      }
      revalidator.revalidate(); // Cập nhật UI
      setIsConfirmOpen(false); // Đóng modal
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
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm chi tiết sản phẩm..." />
        </div>
        <BtnAdd
          route={"/management/variant-variants/create"}
          className="w-[30%]"
          name="Thêm biến thể SP"
        />
      </div>
      <h2 className="my-3">Danh sách biến thể</h2>
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
            {variants.length > 0 ? (
              variants.map((variant, index) => (
                <tr
                  key={variant.id || index}
                  className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                >
                  <td className="p-4 font-bold text-[#323232]">
                    <div className="flex items-center">
                      <div className="w-[60px] h-[60px] border border-gray-200 rounded overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          src={variant.product.thumbnail}
                          alt={variant.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="font-black text-sm text-[#323232] mb-1">
                          {variant.product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-gray-500 italic">
                            Giá gốc:
                          </span>
                          <span className="text-[12px] font-bold text-red-500">
                            {Number(
                              variant.product.base_price
                            ).toLocaleString()}
                            đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      {variant.VariableAttributes &&
                      variant.VariableAttributes.length > 0 ? (
                        variant.VariableAttributes.map((attr) => (
                          <div
                            key={attr.id}
                            className="flex items-center gap-1"
                          >
                            <Badge color="purple">
                              <span className="font-medium">
                                {attr.attributeKey.name}:
                              </span>
                              <span className="ml-1 font-black">
                                {attr.value} {attr.attributeKey.unit || ""}
                              </span>
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Không có phân loại
                        </span>
                      )}

                      <div className="mt-1">
                        <span className="text-xs text-gray-500">Giá bán: </span>
                        <span className="text-sm font-black text-blue-600">
                          {Number(variant.price).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="text-center px-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                      {variant.stock > 0 ? (
                        <Badge color="green">
                          <PackageCheck />
                          <span className="ml-2 font-bold">
                            Sẵn có: {variant.stock}
                          </span>
                        </Badge>
                      ) : (
                        <Badge color="red">
                          <PackageX />
                          <span className="ml-2">Hết hàng</span>
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <BtnEdit
                        route={`/management/product-variants/edit/${variant.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() =>
                          openConfirm(variant.id, variant.product.name)
                        }
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
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa biến thể sản phẩm"
          message={`Bạn đang thực hiện xóa biến thể sản phẩm "${deleteTarget.name}".`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default variantVariant;
