import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
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
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
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
      const response = await categoryApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      {/* Khu vực Tìm kiếm, Tab trạng thái, Action */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm danh mục..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>

        {/* Nhóm tab lọc trạng thái (Hỗ trợ Light/Dark) */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#0D121F]/20 border border-slate-200 dark:border-slate-900/60 rounded-xl shadow-sm dark:shadow-none">
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
                    ? "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <ExcelCrudActions
          basePath="/management/category"
          title="Import / Export danh mục"
          templateFileName="template-danh-muc.xlsx"
          exportFileName="danh-muc.xlsx"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            revalidator.revalidate();
          }}
        />
        <BtnAdd
          route={"/management/categories/create"}
          className="w-full md:w-[30%]"
          name="Thêm danh mục"
        />
      </div>

      {/* Khu vực Bảng hiển thị sử dụng class glass-card chung */}
      <div className="mt-4 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Danh sách danh mục</h2>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tải lại"
          >
            <RefreshCw
              size={18}
              className={revalidator.state === "loading" ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="table-retro mb-4">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th scope="col">Ảnh đại diện</th>
                  <th scope="col">Tên danh mục</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Mã (Slug)</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="whitespace-nowrap">
                        <img
                          src={
                            category.image ||
                            "https://placehold.co/200x200/png?text=No+Logo"
                          }
                          alt={category.name}
                          className="w-[50px] h-auto object-contain m-auto"
                        />
                      </td>
                      <td className="text-center">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {category.name}
                        </span>
                      </td>
                      <td className="text-center">
                        <Badge color={category.is_active ? "green" : "indigo"}>
                          {category.is_active ? "Hiện" : "Ẩn"}
                        </Badge>
                      </td>
                      <td className="text-center font-mono text-slate-500 dark:text-slate-500 text-xs">
                        {category.slug}
                      </td>
                      <td>
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
                      className="px-6 py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm"
                    >
                      Chưa có danh mục nào trên hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
