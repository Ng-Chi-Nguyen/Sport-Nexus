import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { LayoutDashboard } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import { useMemo, useState } from "react";
import categoryApi from "@/api/management/categoryApi";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
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
    title: "Danh mục",
    route: "",
  },
];

const CategoryPage = () => {
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // console.log(responses);
  const categories = responses.data.list_categories;
  const pagination = responses.data.pagination;
  // console.log(categories);

  const openConfirm = (categoryId) => {
    setDeleteTarget(categoryId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await categoryApi.delete(deleteTarget); // Gọi API xóa
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
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
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm danh mục..." />
        </div>
        <BtnAdd
          route={"/management/categories/create"}
          className="w-[30%]"
          name="Thêm danh mục"
        />
      </div>
      <h2 className="my-4">Danh sách danh mục</h2>
      <div className="relative bg-white rounded-[5px]">
        <table className="w-full text-sm text-left table-retro text-[#323232]">
          <thead className="text-sm uppercase bg-primary border-b-2 border-[#323232]">
            <tr>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Ảnh đại diện
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Tên danh mục
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Mã (Slug)
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <tr
                  key={category.id || index}
                  className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-bold text-[#323232] whitespace-nowrap">
                    <img
                      src={
                        category.image ||
                        "https://placehold.co/200x200/png?text=No+Logo"
                      }
                      alt={category.name}
                      className="w-[50px] h-auto object-contain"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded text-[11px] font-bold text-[14px]">
                      {category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge color={category.is_active ? "green" : "indigo"}>
                      {category.is_active ? "Hiện" : "Ẩn"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-gray-400 text-[12px]">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-center">
                      <BtnEdit
                        route={`/management/categories/edit/${category.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() => openConfirm(category.id)}
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
                  Không có quyền nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa danh mục"
          message={`Bạn đang thực hiện xóa danh mục".`}
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

export default CategoryPage;
