import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate, useLoaderData } from "react-router-dom";
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import { Submit_GoBack } from "@/components/ui/button";
import { TitleManagement } from "@/components/ui/title";
import FloatingTextarea from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/ui/select";
import collectionApi from "@/api/management/collectionApi";
import { queryClient } from "@/lib/react-query";
import { useTranslation } from "react-i18next";

const EditCollectionPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "collection" });
  const loaderData = useLoaderData();
  const responseOld = loaderData?.collection;
  const categories = loaderData?.categories || [];
  const navigate = useNavigate();

  const [banner, setBanner] = useState(responseOld?.data?.banner || null);
  const [name, setName] = useState(responseOld?.data?.name || "");
  const [description, setDescription] = useState(
    responseOld?.data?.description || "",
  );
  const [categoryId, setCategoryId] = useState(
    responseOld?.data?.category_id ? String(responseOld.data.category_id) : "",
  );
  const [isActive, setIsActive] = useState(
    responseOld?.data?.is_active ?? true,
  );
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
      title: t("collection_management"),
      route: "/management/collections",
    },
    {
      title: t("edit_breadcrumb"),
      route: "",
    },
  ];

  const categoryOptions = categories.map((c) => ({
    slug: String(c.id),
    name: c.name,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      ShowToast("error", t("select_category_required"));
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    if (banner instanceof File) {
      formData.append("banner", banner);
    }
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category_id", categoryId);
    formData.append("is_active", isActive);

    try {
      const response = await collectionApi.update(responseOld.data.id, formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["collections"] });
        ShowToast("success", response.message || t("update_success"));
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
        {t("edit_collection_heading", { id: responseOld?.data?.id })}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full max-w-4xl"
      >
        <div className="w-full lg:w-[40%] rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
          <TitleManagement color="cyan">{t("collection_banner")}</TitleManagement>
          <div className="mt-3">
            <InputFile value={banner} onChange={(file) => setBanner(file)} />
          </div>
        </div>

        <div className="w-full lg:w-[60%] rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
          <h3 className="font-bold text-xs uppercase border-b pb-2 mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
            <span className="w-2 h-4 rounded-sm bg-sky-500"></span>{" "}
            {t("collection_info")}
          </h3>

          <div className="space-y-4">
            <FloatingInput
              id="name"
              label={t("collection_name_label")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <SimpleSelect
              label={t("collection_category")}
              options={categoryOptions}
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
              placeholder={t("select_category_placeholder")}
            />

            <FloatingTextarea
              id="description"
              label={t("collection_description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <div className="p-3 rounded-lg border transition-colors duration-200 bg-slate-50 border-slate-200 dark:bg-[#111827]/40 dark:border-slate-800">
              <AnimatedCheckbox
                id="isActive"
                label={isActive ? t("show_collection") : t("hide_collection")}
                checked={isActive}
                onChange={(e) => handleStatusChange(e.target.checked)}
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <Submit_GoBack name={t("update_btn")} isLoading={isSubmitting} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCollectionPage;
