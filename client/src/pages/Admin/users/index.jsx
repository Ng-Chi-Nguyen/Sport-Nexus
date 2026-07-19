import { useMemo, useState } from "react";
import { useLoaderData, useRevalidator, Link } from "react-router-dom";
import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import FilterPanel from "@/components/ui/FilterPanel";
import RangeInput from "@/components/ui/RangeInput";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { formatFullDateTime } from "@/utils/formatters";
import { queryClient } from "@/lib/react-query";
import userApi from "@/api/management/userApi";
import avatarDefault from "@/assets/images/avatar-default.jpg";
import useTableFilters from "@/hooks/useTableFilters";
import { USER_STATUS_OPTIONS, USER_VERIFIED_OPTIONS } from "@/constants/management/user";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý người dùng & phân quyền", route: "" },
  { title: "Người dùng", route: "#" },
];

const UserPage = () => {
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    searchParams,
    setSearchParams,
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
  } = useTableFilters();

  const currentStatus = searchParams.get("status") || "";
  const currentIsVerified = searchParams.get("is_verified") || "";
  const currentRoleId = searchParams.get("role_id") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";

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
      setIsConfirmOpen(false);
      toast.error(
        error.message ||
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          "Đã có lỗi xảy ra!"
      );
    }
  };

  const renderSegmented = (filterKey, options, currentValue, label) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-0.5 p-0.5 bg-[#111827]/60 border border-slate-800 rounded-lg h-10">
        {options.map((opt) => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => setFilter(filterKey, opt.slug)}
            className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
              currentValue === opt.slug
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder="Tìm kiếm tên, email, số điện thoại..."
        addButton={
          <BtnAdd route={"/management/users/create"} name="Thêm người dùng" />
        }
      >
        {renderSegmented("status", USER_STATUS_OPTIONS, currentStatus, "Trạng thái")}
        {renderSegmented("is_verified", USER_VERIFIED_OPTIONS, currentIsVerified, "Xác thực")}
        <SimpleSelect
          label="Vai trò"
          value={currentRoleId}
          onChange={(val) => setFilter("role_id", val)}
          options={[
            { slug: "", name: "Tất cả" },
            ...(responses.roles || []).map((r) => ({
              slug: String(r.id),
              name: r.name,
            })),
          ]}
          placeholder="Tất cả"
        />
        <RangeInput
          label="Ngày tạo"
          type="date"
          minValue={currentDateFrom}
          maxValue={currentDateTo}
          onMinChange={(v) => setFilter("date_from", v)}
          onMaxChange={(v) => setFilter("date_to", v)}
        />
      </FilterPanel>

      {/* KHỐI LAYOUT TỐI CHỦ ĐẠO */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="section-title">
          Danh sách người dùng
        </h3>

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
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
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

                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        {user.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span>Đã xác thực</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span>Chưa xác thực</span>
                          </span>
                        )}
                      </div>
                    </td>

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

                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/management/users/add-role/${user.id}`}
                          className="p-2 bg-[#111827] text-slate-400 hover:text-violet-400 border border-slate-800/80 hover:border-violet-500/40 rounded-lg transition-all duration-150"
                          title="Phân quyền hạn"
                        >
                          <ShieldAlert size={14} strokeWidth={2} />
                        </Link>
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
