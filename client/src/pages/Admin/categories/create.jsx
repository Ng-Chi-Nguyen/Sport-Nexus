import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import { Submit_GoBack } from "@/components/ui/button";
import { TitleManagement } from "@/components/ui/title";
// api
import categoryApi from "@/api/management/categoryApi";
// lib
import { queryClient } from "@/lib/react-query";
import { useTranslation } from "react-i18next";

const CreateCategoryPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "category" });
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbData = [
    {
      title: <LayoutDashboard size={18} strokeWidth={1.5} />,
      route: "",
    },
    {
      title: t("product_warehouse_management"),
      route: "",
    },
    {
      title: t("category_management"),
      route: "/management/categories",
    },
    {
      title: t("add_new_breadcrumb"),
      route: "",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    if (image instanceof File) {
      formData.append("image", image);
    }
    formData.append("name", name);
    formData.append("is_active", isActive);

    try {
      const response = await categoryApi.create(formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success(response.message || t("create_success"));
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

  const handleStatusChange = (checkedValue) => {
    setIsActive(checkedValue);
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("add_category_heading")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full max-w-4xl"
      >
        {/* CARD: ẢNH ĐẠI DIỆN */}
        <div className="w-full lg:w-[40%] rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
          <TitleManagement color="cyan">{t("category_avatar")}</TitleManagement>
          <div className="mt-3">
            <InputFile value={image} onChange={(file) => setImage(file)} />
          </div>
        </div>

        {/* CARD: THÔNG TIN DANH MỤC */}
        <div className="w-full lg:w-[60%] rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
          <h3 className="font-bold text-xs uppercase border-b pb-2 mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
            <span className="w-2 h-4 rounded-sm bg-sky-500"></span>{" "}
            {t("category_info")}
          </h3>

          <div className="space-y-4">
            <FloatingInput
              id="name"
              label={t("category_name_label")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="p-3 rounded-lg border transition-colors duration-200 bg-slate-50 border-slate-200 dark:bg-[#111827]/40 dark:border-slate-800">
              <AnimatedCheckbox
                id="isActive"
                label={isActive ? t("show_category") : t("hide_category")}
                checked={isActive}
                onChange={(e) => handleStatusChange(e.target.checked)}
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <Submit_GoBack isLoading={isSubmitting} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryPage;
