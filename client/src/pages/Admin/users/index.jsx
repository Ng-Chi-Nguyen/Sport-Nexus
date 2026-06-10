import { useMemo, useState } from "react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import {
  CheckCheck,
  LayoutDashboard,
  LockOpen,
  Lock,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
// utils
import { formatFullDateTime } from "@/utils/formatters";
// lib
import { queryClient } from "@/lib/react-query";
// image
import avatarDefault from "@/assets/images/avatar-default.jpg";

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
    title: "Người dùng",
    route: "#",
  },
];

const UserPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const usersData = responses?.data?.data || {};

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const allUsers = useMemo(() => {
    if (!usersData) return [];
    return Object.values(usersData).flat();
  }, [usersData]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const openConfirm = (id) => {
    setDeleteTarget(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await userApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        revalidator.revalidate();
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
          <SearchTable placeholder="Tìm kiếm người dùng..." />
        </div>
        <BtnAdd route={"/management/users/create"} name="Thêm người dùng" />
      </div>

      {/* KHỐI LAYOUT TỐI CHỦ ĐẠO */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
          Danh sách người dùng
        </h3>

        {/* BẢNG SẠCH SẼ - ĐỒNG BỘ ĐƯỜNG KẺ TRẮNG MỜ BIÊN DƯỚI */}
        <div className="table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 w-[35%] !text-start">
                  Người dùng
                </th>
                <th scope="col" className="px-6 py-4 w-[25%] !text-start">
                  Liên hệ
                </th>
                <th scope="col" className="px-6 py-4 w-[12%] text-center">
                  Xác thực
                </th>
                <th scope="col" className="px-6 py-4 w-[13%] text-center">
                  Vai trò
                </th>
                <th scope="col" className="px-6 py-4 w-[15%] text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length > 0 ? (
                allUsers.map((user, index) => (
                  <tr key={user.id || index}>
                    {/* CỘT 1: AVATAR LỚN + TÊN + NGÀY TẠO */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {/* Khung chứa ảnh chân dung profile ép cứng size */}
                        <div
                          className="rounded-full border border-slate-800 bg-[#111827] overflow-hidden flex-shrink-0 p-0.5"
                          style={{ width: "64px", height: "64px" }}
                        >
                          <img
                            src={user.avatar || avatarDefault}
                            alt={user.full_name}
                            className="w-full h-full object-cover rounded-full"
                            style={{ width: "100%", height: "100%" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-semibold text-slate-100 text-sm tracking-wide truncate">
                            {user.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Ngày tạo:{" "}
                            <span className="text-slate-400">
                              {formatFullDateTime(user.created_at)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CỘT 2: LIÊN HỆ (EMAIL & SĐT) */}
                    <td className="px-6 py-5 text-start">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-mono text-sky-400 break-all">
                          {user.email}
                        </span>
                        {user.phone_number ? (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-900 border border-slate-800 text-emerald-400">
                            {user.phone_number}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">
                            Chưa có SĐT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CỘT 3: TRẠNG THÁI XÁC THỰC */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        {user.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {/* <UserCheck size={12} /> */}
                            <span>Đã xác thực</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {/* <UserX size={12} /> */}
                            <span>Chưa xác thực</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CỘT 4: LOẠI TÀI KHOẢN (VAI TRÒ) */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        {user.role_id !== 5 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 tracking-wide uppercase">
                            {user.role?.name || "N/A"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wide uppercase">
                            {user.role?.name || "Customer"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CỘT 5: HÀNH ĐỘNG - Tích hợp kèm nút sửa quyền nhanh */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Nút phân quyền nhanh phong cách GlassOS */}
                        <Link
                          to={`/management/users/add-role/${user.id}`}
                          className="p-2 bg-[#111827] text-slate-400 hover:text-violet-400 border border-slate-800/80 hover:border-violet-500/40 rounded-lg transition-all duration-150"
                          title="Phân quyền hạn"
                        >
                          <ShieldAlert size={14} strokeWidth={2} />
                        </Link>

                        {/* Cặp nút Sửa/Xóa chuẩn hệ thống */}
                        <BtnActions
                          route={`/management/users/edit/${user.id}`}
                          id={user.id}
                          onDelete={() => openConfirm(user.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500 italic"
                  >
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa người dùng"
          message="Bạn đang thực hiện hành động xóa người dùng. Toàn bộ dữ liệu liên quan sẽ bị loại bỏ vĩnh viễn khỏi hệ thống."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default UserPage;
