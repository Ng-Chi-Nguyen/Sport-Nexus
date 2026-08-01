import { useState, useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import {
  FloatingInputPassword,
  FloatingInput,
  InputFile,
} from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
// api
import userApi from "@/api/management/userApi";
// lib
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const CreateUserPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "user" });
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("user_management"), route: "" },
    { title: t("users_title"), route: "/management/users" },
    { title: t("create_breadcrumb"), route: "#" },
  ];

  const roleOptions = [
    { slug: "admin", name: t("role_admin") },
    { slug: "warehouse_manager", name: t("role_warehouse_manager") },
    { slug: "purchasing_staff", name: t("role_purchasing_staff") },
    { slug: "sales_staff", name: t("role_sales_staff") },
    { slug: "customer", name: t("role_customer") },
  ];


  // state form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (avatar instanceof File) formData.append("avatar", avatar);

    formData.append("full_name", name);
    formData.append("email", email);
    formData.append("phone_number", phone);
    formData.append("password", password);
    formData.append("slug", selectedRole);

    try {
      const response = await userApi.create(formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
        {t("create_heading")}
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
          <TitleManagement color="green">{t("basic_info_title")}</TitleManagement>
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
            <FloatingInputPassword
              id="Password"
              label={t("password_label")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* KHỐI 3: PHÂN QUYỀN TÀI KHOẢN (4 CỘT) */}
        <div className="col-span-12 md:col-span-12 lg:col-span-4 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md relative z-20 h-fit transition-colors duration-200">
          <TitleManagement color="blue">{t("role_status_title")}</TitleManagement>
          <div className="space-y-6 mt-2">
            <Select
              label={t("account_type_label")}
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder={t("select_role_placeholder")}
            />

            <div className="border-t border-slate-200 dark:border-white/5 pt-5 flex justify-end w-full">
              <Submit_GoBack />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
