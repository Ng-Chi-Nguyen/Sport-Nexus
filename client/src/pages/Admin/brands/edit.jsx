import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { FloatingInput, InputFile } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
import brandApi from "@/api/management/brandApi";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const EditBrandPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "brand" });
  const response = useLoaderData();
  const navigate = useNavigate();
  const brand = response.data;

  const [name, setName] = useState(brand.name);
  const [logo, setLogo] = useState(brand.logo);
  const [selectedOrigin, setSelectedOrigin] = useState(brand.origin);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const breadcrumbData = [
    {
      title: <LayoutDashboard size={20} />,
      route: "",
    },
    {
      title: t("product_warehouse_management"),
      route: "",
    },
    {
      title: t("brand_management"),
      route: "/management/brands",
    },
    {
      title: t("edit_brand_breadcrumb"),
      route: "",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    if (logo instanceof File) {
      formData.append("logo", logo);
    }
    formData.append("name", name);
    formData.append("origin", selectedOrigin);

    try {
      const response = await brandApi.update(brand.id, formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["brands"] });
        toast.success(response.message || t("update_success"));
        navigate(-1);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirm = (name) => {
    setDeleteTarget(name);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await brandApi.delete(brand.id);
      if (response.success) {
        setIsConfirmOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["brands"] });
        toast.success(response.message);
        navigate(-1);
      } else {
        toast.success(response.message);
      }
    } catch (error) {
      setIsConfirmOpen(false);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");

      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("edit_brand_heading")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        <div className="w-full lg:w-[30%] bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
          <TitleManagement color="cyan">{t("brand_logo")}</TitleManagement>
          <div className="mt-3">
            <InputFile value={logo} onChange={(file) => setLogo(file)} />
          </div>
        </div>

        <div className="w-full lg:flex-1 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200 flex flex-col gap-4">
          <TitleManagement color="blue">{t("brand_info")}</TitleManagement>
          <div className="mt-2">
            <FloatingInput
              id="name"
              label={t("brand_name")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <CountrySelect
              value={selectedOrigin}
              onChange={(val) => setSelectedOrigin(val)}
              label={t("origin")}
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 mt-2">
            <Submit_GoBack isLoading={isSubmitting} />
            <button
              type="button"
              onClick={() => openConfirm(brand.name)}
              className="h-[40px] px-5 bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all duration-200 cursor-pointer"
            >
              {t("delete_brand")}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDelete
        isOpen={isConfirmOpen}
        title={t("delete_brand_title")}
        message={t("delete_brand_message", { name: deleteTarget })}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default EditBrandPage;
