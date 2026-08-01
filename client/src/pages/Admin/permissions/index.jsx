import { useMemo, useState, useRef, useEffect } from "react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, HelpCircle, RefreshCw } from "lucide-react";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { SearchTable } from "@/components/ui/search";
import { ConfirmDelete } from "@/components/ui/confirm";
import Badge from "@/components/ui/badge";
// constants
import { PERMISSION_TRANSLATIONS } from "@/constants/permission";
// api
import permissionApi from "@/api/management/permissionApi";
import { queryClient } from "@/lib/react-query";
import { getActionColor } from "@/utils/statusStyles";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý người dùng & phân quyền", route: "" },
  { title: "Phân quyền", route: "" },
];

const PermissionPage = () => {
  const response = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // state quản lý modal xóa
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // --- LOGIC QUẢN LÝ BẢNG POP-UP MODULES ---
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const popoverRef = useRef(null);

  // Tự động đóng bảng tra cứu khi người dùng click ra vùng ngoài màn hình
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsModuleOpen(false);
      }
    };
    if (isModuleOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModuleOpen]);

  const permissionsData = response?.data || {};
  const paginationInfo = response?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const allPermissions = useMemo(() => {
    if (!permissionsData) return [];
    return Object.values(permissionsData).flat();
  }, [permissionsData]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const openConfirm = (slug) => {
    setDeleteTarget(slug);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await permissionApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["permissions"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
      setIsConfirmOpen(false);
      const errorMessage =
        error.message || error.response?.data?.message || "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & CỤM NÚT HÀNH ĐỘNG PHÍA NGOÀI */}
      <div className="flex items-center gap-4 relative">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm mã quyền hạn..." />
        </div>

        {/* NÚT BẤM TRA CỨU MODULE ĐỘC LẬP NGOÀI BẢNG */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsModuleOpen(!isModuleOpen)}
            className={`h-[44px] px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
              isModuleOpen
                ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-500/40 shadow-sm"
                : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <HelpCircle size={15} strokeWidth={2.5} />
            Tra cứu Module
          </button>

          {/* BẢNG HIỂN THỊ NỘI DUNG POP-UP MODULES */}
          {isModuleOpen && (
            <div className="absolute right-0 top-full mt-2.5 z-50 w-[320px] p-4 bg-white dark:bg-[#0D121F]/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 transition-colors duration-200">
              <p className="text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-white/5 mb-3 pb-1.5 font-bold font-mono text-xs tracking-wider">
                DANH SÁCH MODULES HỆ THỐNG:
              </p>
              <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {Object.entries(PERMISSION_TRANSLATIONS.modules).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center text-xs py-0.5 border-b border-slate-100 dark:border-white/[0.02]"
                    >
                      <span className="text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">
                        {key}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {value}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        <BtnAdd route={"/management/permissions/create"} name="Thêm quyền" />
      </div>

      {/* KHỐI LAYOUT CHỦ ĐẠO */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md relative z-10 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Danh sách quyền hạn</h3>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tải lại"
          >
            <RefreshCw
              size={18}
              className={revalidator.state === "loading" ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="mb-2 table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[35%] text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Tên quyền
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[20%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Bảng (Module)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[15%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[20%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Mã hệ thống (Slug)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[10%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {allPermissions.length > 0 ? (
                  allPermissions.map((permission, index) => (
                    <tr
                      key={permission.id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 tracking-wide whitespace-nowrap">
                        {permission.name}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Badge color="slate">
                          <span className="font-mono uppercase tracking-wide">
                            {permission.module}
                          </span>
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Badge color={getActionColor(permission.action)}>
                          <span className="font-bold uppercase min-w-[55px] text-center inline-block">
                            {permission.action}
                          </span>
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-slate-400 dark:text-slate-500 text-[12px] tracking-wide">
                        {permission.slug}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <BtnActions
                          route={`/management/permissions/edit/${permission.slug}`}
                          id={permission.slug}
                          onDelete={() => openConfirm(permission.slug)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                    >
                      Không tìm thấy quyền hạn nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa quyền hạn"
          message={`Bạn đang thực hiện xóa mã quyền "${deleteTarget}". Toàn bộ dữ liệu phân quyền này sẽ bị loại bỏ vĩnh viễn khỏi hệ thống.`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default PermissionPage;
