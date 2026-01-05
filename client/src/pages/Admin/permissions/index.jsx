import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnDelete, BtnEdit, BtnAdd } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { ConfirmDelete } from "@/components/ui/confirm";
// constants
import { PERMISSION_TRANSLATIONS } from "@/constants/permission";
// api
import permissionApi from "@/api/management/permissionApi";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Phân quyền",
    route: "",
  },
];

const ACTION_COLORS = {
  create: "green",
  read: "blue",
  update: "yellow",
  delete: "red",
};

const PermissionPagePage = () => {
  const response = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // 1. Lấy danh sách 6 item cho bảng
  const permissionsData = response?.data || {};

  // 2. Lấy pagination thực tế (bây giờ sẽ là 2)
  const paginationInfo = response?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };
  const allPermissions = useMemo(() => {
    if (!permissionsData) return [];
    // Làm phẳng mảng users để render 6 dòng
    return Object.values(permissionsData).flat();
  }, [permissionsData]);

  // LOG KIỂM TRA: Pagination Info lúc này phải hiện totalPages: 2
  // console.log("Pagination Info thực tế:", paginationInfo);
  // LOG để kiểm tra - Bây giờ sẽ hiện Array(6)
  // console.log("Pagination Info:", paginationInfo);
  // console.log("Dữ liệu bảng thực tế:", allPermissions);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const openConfirm = (slug) => {
    setDeleteTarget(slug);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await permissionApi.delete(deleteTarget); // Gọi API xóa
      revalidator.revalidate(); // Cập nhật UI
      setIsConfirmOpen(false); // Đóng modal
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      <div className="p-2">
        <div className="flex items-center gap-4">
          <div className="w-[80%] relative group">
            <SearchTable placeholder="Search permissions..." />
          </div>
          <BtnAdd
            route={"/management/permissions/create"}
            className="w-[20%]"
            name="Thêm quyền"
          />
        </div>
      </div>

      <div className="p-2">
        <h3 className="mb-2">Danh sách quyền</h3>

        <div className="relative bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rounded-[5px]">
          <table className="w-full text-sm text-left text-[#323232]">
            <thead className="text-sm uppercase bg-primary border-b-2 border-[#323232]">
              <tr>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Tên quyền
                </th>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Bảng
                  <Tooltip
                    content={
                      <div className="space-y-3">
                        {/* Hiển thị danh sách Modules */}
                        <div>
                          <p className="text-[#4facf3] border-b border-[#4facf3] mb-1 pb-1">
                            BẢNG (MODULES):
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(
                              PERMISSION_TRANSLATIONS.modules
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between gap-2"
                              >
                                <span className="text-gray-400">{key}:</span>
                                <span className="text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    }
                  />
                </th>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Quyền
                  <Tooltip
                    content={
                      <div className="space-y-3">
                        {/* Hiển thị danh sách Actions */}
                        <div>
                          <p className="text-[#4facf3] border-b border-[#4facf3] mb-1 pb-1">
                            HÀNH ĐỘNG (ACTIONS):
                          </p>
                          <div className="grid grid-cols-1 gap-y-1">
                            {Object.entries(
                              PERMISSION_TRANSLATIONS.actions
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between gap-2"
                              >
                                <span className="text-gray-400">{key}:</span>
                                <span className="text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    }
                  />
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
              {allPermissions.length > 0 ? (
                allPermissions.map((permission, index) => (
                  <tr
                    key={permission.id || index}
                    className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-bold text-[#323232] whitespace-nowrap">
                      {permission.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 px-3 py-1 rounded border border-[#323232] text-[11px] font-bold uppercase">
                        {permission.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={ACTION_COLORS[permission.action]}>
                        {permission.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-400 text-[12px]">
                      {permission.slug}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 justify-center">
                        <BtnEdit
                          route={`/management/permissions/edit/${permission.slug}`}
                          name="Sửa"
                        />
                        <BtnDelete
                          name="Xóa"
                          onClick={() => openConfirm(permission.slug)}
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
        </div>
        {/* HIỂN THỊ PHÂN TRANG */}
        <div className="py-4 border-t-2 border-[#323232] bg-[#f8f9fa]">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa quyền hạn"
          message={`Bạn đang thực hiện xóa quyền "${deleteTarget}". Dữ liệu này sẽ mất vĩnh viễn khỏi Sport Nexus.`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default PermissionPagePage;
