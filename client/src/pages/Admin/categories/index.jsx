import { useState, useEffect, useRef } from "react";
import { LayoutDashboard } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import categoryApi from "@/api/management/categoryApi";
import Pagination from "@/components/ui/pagination";
// lib
import { queryClient } from "@/lib/react-query";

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
  const currentActive = searchParams.get("is_active") || "";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const categories = responses?.data?.list_categories || [];
  const pagination = responses?.data?.pagination;

  const handleActiveClick = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("is_active", value);
    else params.delete("is_active");
    setSearchParams(params);
  };

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
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm danh mục..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-[#0D121F]/20 border border-slate-900/60 rounded-xl">
          {[
            { value: "", label: "Tất cả" },
            { value: "true", label: "Hiện" },
            { value: "false", label: "Ẩn" },
          ].map((tab) => {
            const isActive = currentActive === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleActiveClick(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <BtnAdd
          route={"/management/categories/create"}
          className="w-[30%]"
          name="Thêm danh mục"
        />
      </div>
      <div className="mt-2 bg-[#0D121F]/40 border border-slate-900 rounded-2xl pt-2 pl-2 shadow-2xl backdrop-blur-md">
        <h2 className="section-title">Danh sách danh mục</h2>
        <div className="mb-2 table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Ảnh đại diện
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Tên danh mục
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Mã (Slug)
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={
                          category.image ||
                          "https://placehold.co/200x200/png?text=No+Logo"
                        }
                        alt={category.name}
                        className="w-[50px] h-auto object-contain m-auto"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-200">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={category.is_active ? "green" : "indigo"}>
                        {category.is_active ? "Hiện" : "Ẩn"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-slate-500 text-xs">
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
                    className="px-6 py-20 text-center text-slate-500 italic text-sm"
                  >
                    Chưa có danh mục nào trên hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalPages={pagination?.totalPages || 1}
          currentPage={pagination?.currentPage || 1}
          onPageChange={handlePageChange}
        />
      </div>

      <ConfirmDelete
        isOpen={isConfirmOpen}
        title="Xóa danh mục"
        message="Bạn đang thực hiện xóa danh mục."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default CategoryPage;
