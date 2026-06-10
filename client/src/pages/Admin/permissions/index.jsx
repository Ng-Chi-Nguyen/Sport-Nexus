import { useMemo, useState } from "react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard } from "lucide-react";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button"; // Đổi sang dùng BtnActions chuẩn hệ thống
import Pagination from "@/components/ui/pagination";
import { SearchTable } from "@/components/ui/search";
import Tooltip from "@/components/ui/tooltip";
import { ConfirmDelete } from "@/components/ui/confirm";
// constants
import { PERMISSION_TRANSLATIONS } from "@/constants/permission";
// api
import permissionApi from "@/api/management/permissionApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={18} strokeWidth={1.5} />,
    route: "",
  },
  {
    title: "Quản lý người dùng & phân quyền",
    route: "",
  },
  {
    title: "Phân quyền",
    route: "",
  },
];

// Hàm cấu hình màu sắc neon mềm mại tương ứng với từng hành động trên nền tối
const getActionBadgeClass = (action) => {
  const styles = {
    create: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    read: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    update: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    delete: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return styles[action] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

const PermissionPagePage = () => {
  const response = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const permissionsData = response?.data || {};

  const paginationInfo = response?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const allPermissions = useMemo(() => {
    if (!permissionsData) return [];
    return Object.values(permissionsData).flat();
  }, [permissionsData]);

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
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm mã quyền hạn..." />
        </div>
        <BtnAdd route={"/management/permissions/create"} name="Thêm quyền" />
      </div>

      {/* KHỐI LAYOUT TỐI CHỦ ĐẠO HỆ THỐNG */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
          Danh sách quyền hạn
        </h3>

        {/* BẢNG ĐƯỜNG KẺ TRẮNG MỜ BIÊN DƯỚI */}
        <div className="table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 w-[30%] !text-start">
                  Tên quyền
                </th>
                <th scope="col" className="px-6 py-4 w-[20%] text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Bảng (Module)</span>
                    <Tooltip
                      content={
                        <div className="space-y-3 bg-[#111827] p-2 border border-slate-800 rounded-lg max-w-[280px]">
                          <div>
                            <p className="text-sky-400 border-b border-slate-800 mb-1.5 pb-1 font-semibold text-xs">
                              DANH SÁCH MODULES:
                            </p>
                            <div className="grid grid-cols-1 gap-y-1 text-[11px]">
                              {Object.entries(
                                PERMISSION_TRANSLATIONS.modules,
                              ).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between gap-4"
                                >
                                  <span className="text-slate-500 font-mono">
                                    {key}:
                                  </span>
                                  <span className="text-slate-300">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 w-[15%] text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Hành động</span>
                    <Tooltip
                      content={
                        <div className="space-y-3 bg-[#111827] p-2 border border-slate-800 rounded-lg min-w-[180px]">
                          <div>
                            <p className="text-sky-400 border-b border-slate-800 mb-1.5 pb-1 font-semibold text-xs">
                              LOẠI ACTIONS:
                            </p>
                            <div className="grid grid-cols-1 gap-y-1 text-[11px]">
                              {Object.entries(
                                PERMISSION_TRANSLATIONS.actions,
                              ).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between gap-4"
                                >
                                  <span className="text-slate-500 font-mono">
                                    {key}:
                                  </span>
                                  <span className="text-slate-300">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 w-[23%] text-center">
                  Mã hệ thống (Slug)
                </th>
                <th scope="col" className="px-6 py-4 w-[12%] text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {allPermissions.length > 0 ? (
                allPermissions.map((permission, index) => (
                  <tr key={permission.id || index}>
                    {/* CỘT 1: TÊN QUYỀN */}
                    <td className="px-6 py-5 font-semibold text-slate-200 tracking-wide whitespace-nowrap">
                      {permission.name}
                    </td>

                    {/* CỘT 2: MODULE */}
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#111827] border border-slate-800 text-slate-400 tracking-wide uppercase">
                        {permission.module}
                      </span>
                    </td>

                    {/* CỘT 3: ACTION BADGE GLOW */}
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[65px] px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border ${getActionBadgeClass(permission.action)}`}
                      >
                        {permission.action}
                      </span>
                    </td>

                    {/* CỘT 4: SLUG HỆ THỐNG */}
                    <td className="px-6 py-5 text-center font-mono text-slate-500 text-[12px] tracking-wide">
                      {permission.slug}
                    </td>

                    {/* CỘT 5: THAO TÁC CỦA BTNACTIONS */}
                    <td className="px-6 py-5 text-center">
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
                    className="px-6 py-12 text-center text-slate-500 italic"
                  >
                    Không tìm thấy quyền hạn nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* HIỂN THỊ PHÂN TRANG */}
        <div className="mt-6">
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

export default PermissionPagePage;
