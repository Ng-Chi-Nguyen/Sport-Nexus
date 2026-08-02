import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import attributeKeyApi from "@/api/core/attributrKeyApi";
import ShowToast from "@/components/ui/toast";
import { queryClient } from "@/lib/react-query";
import { useNavigate } from "react-router-dom";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const CreateAttributeKey = () => {
  const { t } = useTranslation("translation", { keyPrefix: "attributeKey" });
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
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
      title: t("product_attributes"),
      route: "/management/attribute-key/",
    },
    {
      title: t("create_new"),
      route: "",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("unit", unit);

    try {
      const response = await attributeKeyApi.create(formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["attribute-keys"] });
        ShowToast("success", response.message || t("create_success"));
        navigate(-1);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");

      ShowToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-xl bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200"
      >
        <TitleManagement color="blue">
          {t("attribute_information")}
        </TitleManagement>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="flex-1">
            <FloatingInput
              label={t("attribute_name")}
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <FloatingInput
              label={t("unit")}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5">
          <Submit_GoBack isLoading={isSubmitting} />
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeKey;
