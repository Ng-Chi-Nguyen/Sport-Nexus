import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { BtnActions } from "@/components/ui/button";
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
  // console.log(responses);
  // console.log(variants);

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
          route={"/management/product-variants/create"}
          className="w-[30%]"
          name="Thêm biến thể SP"
        />
      </div>
      <h2 className="my-3">Danh sách biến thể</h2>
      <div className="table-retro mt-2">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-4 text-start">
                Thông tin sản phẩm
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Thông tin phân loại
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.length > 0 ? (
              variants.map((variant, index) => (
                <tr key={variant.id || index}>
                  {/* CỘT 1: THÔNG TIN SẢN PHẨM */}
                  <td className="p-6">
                    <div className="flex items-center">
                      {/* Khung ảnh sản phẩm tối giản, đồng điệu */}
                      <div className="w-[60px] h-[60px] border border-slate-800 rounded-lg overflow-hidden bg-[#111827] flex-shrink-0 p-1">
                        <img
                          src={variant.product.thumbnail}
                          alt={variant.product.name}
                          className="w-full h-full object-contain mix-blend-screen"
                        />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-100 mb-1.5 tracking-wide">
                          {variant.product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-slate-500">
                            Giá gốc:
                          </span>
                          <span className="text-[12px] font-semibold text-emerald-400">
                            {Number(
                              variant.product.base_price,
                            ).toLocaleString()}
                            đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 2: THÔNG TIN PHÂN LOẠI */}
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      {variant.VariableAttributes &&
                      variant.VariableAttributes.length > 0 ? (
                        variant.VariableAttributes.map((attr) => (
                          <div key={attr.id} className="flex items-center">
                            {/* Tận dụng class .table-badge tối mờ đã tạo trong file CSS */}
                            <span className="table-badge">
                              <span className="text-slate-400 mr-1 font-normal">
                                {attr.attributeKey.name}:
                              </span>
                              <span className="font-semibold">
                                {attr.value} {attr.attributeKey.unit || ""}
                              </span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs">
                          Không có phân loại
                        </span>
                      )}

                      <div className="mt-1">
                        <span className="text-xs text-slate-500">
                          Giá bán:{" "}
                        </span>
                        <span className="text-sm font-semibold text-sky-400">
                          {Number(variant.price).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 3: TRẠNG THÁI TỒN KHO */}
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {variant.stock > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <PackageCheck size={14} />
                          <span>Sẵn có: {variant.stock}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <PackageX size={14} />
                          <span>Hết hàng</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* CỘT 4: HÀNH ĐỘNG - Thay cụm Sửa/Xóa to bằng BtnActions */}
                  <td className="px-6 py-6 text-center">
                    <BtnActions
                      route={`/management/product-variants/edit/${variant.id}`}
                      id={variant.id}
                      onDelete={() =>
                        openConfirm(variant.id, variant.product.name)
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-500 italic"
                >
                  Không có biến thể nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          totalPages={paginationInfo.totalPages}
          currentPage={paginationInfo.currentPage}
          onPageChange={handlePageChange}
        />
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
