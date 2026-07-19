import { useMemo, useState, useEffect, useRef } from "react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  Filter,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { SimpleSelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
// utils
import { formatFullDateTime } from "@/utils/formatters";
// lib
import { queryClient } from "@/lib/react-query";
// api
import userApi from "@/api/management/userApi";
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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentIsVerified = searchParams.get("is_verified") || "";
  const currentRoleId = searchParams.get("role_id") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters = currentStatus || currentIsVerified || currentRoleId || currentDateFrom || currentDateTo;

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value !== '' && value !== undefined) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

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
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
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

  const statusOptions = [
    { slug: "", name: "Tất cả" },
    { slug: "true", name: "Hoạt động" },
    { slug: "false", name: "Vô hiệu" },
  ];

  const verifiedOptions = [
    { slug: "", name: "Tất cả" },
    { slug: "true", name: "Đã xác thực" },
    { slug: "false", name: "Chưa xác thực" },
  ];

  const roles = responses.roles || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT LỌC */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm tên, email, số điện thoại..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
            hasActiveFilters
              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
              : "bg-[#111827]/40 text-slate-400 border-slate-800 hover:bg-[#161F32] hover:text-slate-200"
          }`}
        >
          <Filter size={14} />
          Bộ lọc
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
          <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
        </button>
        <BtnAdd route={"/management/users/create"} name="Thêm người dùng" />
      </div>

      {/* Filter panel */}
      <div className={`transition-all duration-300 ease-in-out ${
        showFilters ? "max-h-[500px] opacity-100 mb-4 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="p-4 bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg">
          <div className="flex items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-end">
            {/* Trạng thái */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Trạng thái
              </label>
              <div className="flex items-center gap-0.5 p-0.5 bg-[#111827]/60 border border-slate-800 rounded-lg h-10">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.slug}
                    type="button"
                    onClick={() => setFilter("status", opt.slug)}
                    className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
                      currentStatus === opt.slug
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Xác thực */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Xác thực
              </label>
              <div className="flex items-center gap-0.5 p-0.5 bg-[#111827]/60 border border-slate-800 rounded-lg h-10">
                {verifiedOptions.map((opt) => (
                  <button
                    key={opt.slug}
                    type="button"
                    onClick={() => setFilter("is_verified", opt.slug)}
                    className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
                      currentIsVerified === opt.slug
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Vai trò */}
            <SimpleSelect
              label="Vai trò"
              value={currentRoleId}
              onChange={(val) => setFilter("role_id", val)}
              options={[
                { slug: "", name: "Tất cả" },
                ...roles.map((r) => ({ slug: String(r.id), name: r.name })),
              ]}
              placeholder="Tất cả"
            />

            {/* Ngày tạo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ngày tạo
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={currentDateFrom}
                  onChange={(e) => setFilter("date_from", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="date"
                  value={currentDateTo}
                  onChange={(e) => setFilter("date_to", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                />
              </div>
            </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-10 shrink-0 px-3 text-xs font-bold rounded-lg border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>
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
