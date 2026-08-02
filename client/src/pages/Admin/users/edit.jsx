import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
// components
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
// api
import userApi from "@/api/management/userApi";
// lib
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const EditUserPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "user" });
  const navigate = useNavigate();
  const response = useLoaderData();
  const user = response.data.user;

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("user_management"), route: "" },
    { title: t("users_title"), route: "/management/users" },
    { title: t("edit_breadcrumb"), route: "#" },
  ];

  const roleOptions = [
    { slug: "admin", name: t("role_admin") },
    { slug: "warehouse_manager", name: t("role_warehouse_manager") },
    { slug: "purchasing_staffe", name: t("role_purchasing_staff") },
    { slug: "sales_staff", name: t("role_sales_staff") },
    { slug: "customer", name: t("role_customer") },
  ];

  // state value response
  const [name, setName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone_number);
  const [isVerified, setIsVerified] = useState(user.is_verified);
  const [status, setStatus] = useState(user.status);
  const [avatar, setAvatar] = useState(user.avatar);
  const [selectedRole, setSelectedRole] = useState(user.role.slug);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("full_name", name);
    data.append("email", email);
    data.append("phone_number", phone);
    data.append("status", status);
    data.append("is_verified", isVerified);
    data.append("slug", selectedRole);

    if (avatar instanceof File) {
      data.append("avatar", avatar);
    }

    try {
      const response = await userApi.update(user.id, data);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        ShowToast("success", response.message);
        navigate(-1);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    }
  };

  const handleStatusChange = (checkedValue) => {
    setStatus(checkedValue);
  };

  const handleVerifiedChange = (checkedValue) => {
    setIsVerified(checkedValue);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("edit_heading")}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 w-full">
        {/* KHỐI 1: ẢNH ĐẠI DIỆN (3 CỘT) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md h-fit transition-colors duration-200">
          <TitleManagement color="cyan">{t("avatar_title")}</TitleManagement>
          <div className="flex items-center justify-center w-full py-2">
            <InputFile value={avatar} onChange={(file) => setAvatar(file)} />
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN CƠ BẢN (5 CỘT) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md h-fit transition-colors duration-200">
          <TitleManagement color="green">
            {t("basic_info_title")}
          </TitleManagement>
          <div className="space-y-5 mt-2">
            <FloatingInput
              id="full_name"
              label={t("full_name_label")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FloatingInput
              id="email"
              label={t("email_label")}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FloatingInput
              id="phone_number"
              label={t("phone_label")}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* KHỐI 3: TRẠNG THÁI & PHÂN QUYỀN (4 CỘT) */}
        <div className="col-span-12 md:col-span-12 lg:col-span-4 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md relative z-20 h-fit transition-colors duration-200">
          <TitleManagement color="blue">
            {t("role_status_title")}
          </TitleManagement>

          <div className="grid grid-cols-2 gap-3 mb-6 mt-2">
            <div className="border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/40 p-3 rounded-xl flex items-center justify-center transition-colors duration-150 hover:border-slate-300 dark:hover:border-slate-700">
              <AnimatedCheckbox
                id="is_verified_checkbox"
                label={isVerified ? t("verified") : t("not_verified")}
                checked={isVerified}
                onChange={(e) => handleVerifiedChange(e.target.checked)}
              />
            </div>
            <div className="border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/40 p-3 rounded-xl flex items-center justify-center transition-colors duration-150 hover:border-slate-300 dark:hover:border-slate-700">
              <AnimatedCheckbox
                id="is_active_checkbox"
                label={status ? t("active_check") : t("locked_check")}
                checked={status}
                onChange={(e) => handleStatusChange(e.target.checked)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label={t("account_type_label")}
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder={t("select_role_placeholder")}
            />

            <div className="border-t border-slate-200 dark:border-white/5 pt-4 flex justify-end w-full">
              <Submit_GoBack />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
