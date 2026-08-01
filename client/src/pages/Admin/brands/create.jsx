import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput, InputFile } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/select";
import brandApi from "@/api/management/brandApi";
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const CreateBrandPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "brand" });
  const navigate = useNavigate();
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      title: t("add_brand_title"),
      route: "",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("origin", selectedOrigin);
    if (logo instanceof File) {
      formData.append("logo", logo);
    }

    try {
      const response = await brandApi.create(formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["brands"] });
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

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("add_brand_heading")}
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
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5 mt-2">
            <Submit_GoBack isLoading={isSubmitting} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBrandPage;
