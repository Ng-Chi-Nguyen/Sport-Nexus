import { useState, useRef, useEffect } from "react";
import { LayoutDashboard, HelpCircle } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
// components
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import PermissionTable from "./permissionTable";
// constants
import { PERMISSION_TRANSLATIONS } from "@/constants/permission";
// api
import userApi from "@/api/management/userApi";
import { useTranslation } from "react-i18next";

const AddRolePermissionPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "user" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("user_management"), route: "" },
    { title: t("users_title"), route: "/management/users" },
    { title: t("grant_breadcrumb"), route: "#" },
  ];

  const loaderData = useLoaderData();
  const { user, allPermissions } = loaderData;

  const userData = user?.data?.user;
  const permissionsData = allPermissions?.data;
  const userPerms = userData?.permissions || [];
  const rolePerms = userData?.role?.permissions || [];

  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const popoverRef = useRef(null);

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

  const handleSavePermissions = async (selectedIds) => {
    try {
      const response = await userApi.updatePermission(userData.id, {
        permissionIds: selectedIds,
      });
      if (response.success) {
        ShowToast("success", t("update_success"));
      }
    } catch (error) {
      console.error("Lỗi:", error);
      ShowToast("error", error.response?.data?.message || t("update_failed"));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* KHỐI TIÊU ĐỀ: Đã sửa lỗi dính chữ bằng cách flex-wrap và thêm gap */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-sm bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
            {t("permission_matrix")}
          </h2>

          {/* Cụm thông tin tài khoản: Dùng gap, wrap và break-all để không bị dính chữ */}
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="shrink-0">{t("account_label")}</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold truncate max-w-[150px] sm:max-w-none">
              {userData?.full_name}
            </span>
            <span className="text-slate-400 shrink-0">|</span>
            <span className="font-mono text-slate-500 text-[11px] truncate max-w-[180px] sm:max-w-none">
              {userData?.email}
            </span>
            <span className="text-slate-400 shrink-0">|</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium uppercase tracking-wider shrink-0">
              {userData?.role?.name || t("member")}
            </span>
          </div>
        </div>

        {/* Cụm nút hành động góc phải */}
        <div className="flex items-center gap-2 relative shrink-0">
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsModuleOpen(!isModuleOpen)}
              className={`h-[38px] px-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border transition-all duration-200 cursor-pointer ${
                isModuleOpen
                  ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40"
                  : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <HelpCircle size={14} strokeWidth={2.5} />
              <span>{t("lookup_module")}</span>
            </button>

            {isModuleOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-[280px] sm:w-[320px] p-4 bg-white dark:bg-[#0D121F]/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-white/5 mb-3 pb-1.5 font-bold font-mono text-xs tracking-wider">
                  {t("modules_header")}
                </p>
                <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(PERMISSION_TRANSLATIONS.modules).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center text-xs py-1 border-b border-slate-100 dark:border-white/[0.02]"
                      >
                        <span className="text-slate-400 font-mono font-bold uppercase">
                          {key}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-right">
                          {tc(value)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-[38px] px-4 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {t("go_back")}
          </button>
        </div>
      </div>

      {/* CONTAINER CHÍNH */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-3 rounded-full bg-violet-500"></span>
            {t("module_acl")}
          </h3>
        </div>

        {/* Bảng ma trận: Đảm bảo bọc đủ thẻ div cuộn ngang */}
        <PermissionTable
          allPermissions={permissionsData}
          userPermissions={userPerms}
          rolePermissions={rolePerms}
          onSave={handleSavePermissions}
        />
      </div>
    </div>
  );
};

export default AddRolePermissionPage;
