import { useState, useMemo } from "react";
import { useLoaderData, useRevalidator, Link } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, RefreshCw } from "lucide-react";
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
import {
  USER_STATUS_OPTIONS,
  USER_VERIFIED_OPTIONS,
} from "@/constants/management/user";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";

const UserPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "user" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const responses = useLoaderData();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("user_management"), route: "" },
    { title: t("users_title"), route: "#" },
  ];

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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    setTimeout(() => revalidator.revalidate(), 0);
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
        toast.success(response.message || t("delete_success"));
      }
    } catch (error) {
      setIsConfirmOpen(false);
      toast.error(
        error.message ||
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          t("error_occurred"),
      );
    }
  };

  const renderSegmented = (filterKey, options, currentValue, label) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-[#111827]/60 border border-slate-200 dark:border-slate-800 rounded-lg h-10">
        {options.map((opt) => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => setFilter(filterKey, opt.slug)}
            className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
              currentValue === opt.slug
                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            {tc(opt.name)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder={t("search_placeholder")}
        addButton={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ExcelCrudActions
              basePath="/management/user"
              title={t("import_export_title")}
              templateFileName="template-nguoi-dung.xlsx"
              exportFileName="nguoi-dung.xlsx"
            />
            <BtnAdd route={"/management/users/create"} name={t("add_user")} />
          </div>
        }
      >
        {renderSegmented(
          "status",
          USER_STATUS_OPTIONS,
          currentStatus,
          t("status_label"),
        )}
        {renderSegmented(
          "is_verified",
          USER_VERIFIED_OPTIONS,
          currentIsVerified,
          t("verified_label"),
        )}
        <SimpleSelect
          label={t("role_label")}
          value={currentRoleId}
          onChange={(val) => setFilter("role_id", val)}
          options={[
            { slug: "", name: t("all") },
            ...(responses.roles || []).map((r) => ({
              slug: String(r.id),
              name: r.name,
            })),
          ]}
          placeholder={t("all")}
        />
        <RangeInput
          label={t("created_at_label")}
          type="date"
          minValue={currentDateFrom}
          maxValue={currentDateTo}
          onMinChange={(v) => setFilter("date_from", v)}
          onMaxChange={(v) => setFilter("date_to", v)}
        />
      </FilterPanel>

      {/* KHỐI LAYOUT SÁNG/TỐI ĐỒNG BỘ */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">{t("list_title")}</h3>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("reload")}
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
                    {t("user_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[25%] text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("contact_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[12%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("verified_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[13%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("role_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[15%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("actions_col")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {allUsers.length > 0 ? (
                  allUsers.map((user, index) => (
                    <tr
                      key={user.id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111827] overflow-hidden flex-shrink-0 p-0.5"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <img
                              src={user.avatar || avatarDefault}
                              alt={user.full_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wide truncate">
                              {user.full_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t("created_at")}{" "}
                              <span className="text-slate-600 dark:text-slate-400">
                                {formatFullDateTime(user.created_at)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-start">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-mono text-sky-600 dark:text-sky-400 break-all">
                            {user.email}
                          </span>
                          {user.phone_number ? (
                            <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                              {user.phone_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 text-[11px] italic">
                              {t("no_phone")}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {user.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                              <span>{t("verified")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20">
                              <span>{t("not_verified")}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {user.role_id !== 5 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-500/20 tracking-wide uppercase">
                              {user.role?.name || "N/A"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 tracking-wide uppercase">
                              {user.role?.name || "Customer"}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            to={`/management/users/add-role/${user.id}`}
                            className="p-2 bg-slate-100 dark:bg-[#111827] text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-800/85 hover:border-violet-300 dark:hover:border-violet-500/40 rounded-lg transition-all duration-150"
                            title={t("assign_permission")}
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
                      className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                    >
                      {t("no_users")}
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
          title={t("delete_title")}
          message={t("delete_message")}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default UserPage;
