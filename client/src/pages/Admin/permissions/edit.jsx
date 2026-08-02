import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
// components
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
// api
import permissionApi from "@/api/management/permissionApi";
// constants
import { MODULE_LABELS, ACTION_OPTIONS } from "@/constants/permission";
// lib
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const EditPermissionPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "permission" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const navigate = useNavigate();
  const permissionData = useLoaderData();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("user_management"), route: "" },
    { title: t("permission_title"), route: "/management/permissions" },
    { title: t("edit_breadcrumb"), route: "#" },
  ];

  // Dữ liệu gửi đi
  const [selectedRole, setSelectedRole] = useState(permissionData.module);
  const [selectedAction, setSelectedAction] = useState(permissionData.action);
  const [permissionName, setPermissionName] = useState(permissionData.name);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: permissionName,
      module: selectedRole,
      action: selectedAction,
    };

    try {
      const response = await permissionApi.update(
        permissionData.slug,
        formData,
      );
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["permissions"] });
        ShowToast("success", response.message);
        navigate(-1);
      }
    } catch (error) {
      console.error(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    }
  };

  const moduleOptions = useMemo(() => {
    return Object.entries(MODULE_LABELS).map(([key, value]) => ({
      slug: key,
      name: tc(value),
    }));
  }, [tc]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase mb-3">
        {t("edit_heading")}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 w-full">
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md relative z-20 transition-colors duration-200">
          <TitleManagement color="violet">{t("config_title")}</TitleManagement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 mt-2">
            <div className="flex flex-col gap-1">
              <Select
                label={t("role_label")}
                options={moduleOptions}
                value={selectedRole}
                onChange={(val) => setSelectedRole(val)}
                placeholder={t("select_placeholder")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Select
                label={t("action_label")}
                options={ACTION_OPTIONS.map((o) => ({
                  slug: o.slug,
                  name: tc(o.name),
                }))}
                value={selectedAction}
                onChange={(val) => setSelectedAction(val)}
                placeholder={t("select_placeholder")}
              />
            </div>
          </div>

          <div className="w-full mb-8">
            {permissionName !== undefined && (
              <FloatingInput
                id="permission_name"
                label={t("name_label")}
                required
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
              />
            )}
          </div>

          <div className="flex justify-end border-t border-slate-200 dark:border-white/5 pt-5 w-full">
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPermissionPage;
