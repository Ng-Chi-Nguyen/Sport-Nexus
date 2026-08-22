import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SelectPro } from "@/components/ui/select";
import { InputFile } from "@/components/ui/input";
import { FloatingInput } from "@/components/ui/input";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import FloatingTextarea from "@/components/ui/textarea";
import { Submit_GoBack } from "@/components/ui/button";
import ShowToast from "@/components/ui/toast";
import productdApi from "@/api/core/productApi";
import productImageApi from "@/api/core/productImageApi";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import MultiFileUpload from "@/components/ui/MultiFileUpload";
import { useTranslation } from "react-i18next";

const EditProductPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "product" });
  const { brands, suppliers, categories, product } = useLoaderData();
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    {
      title: t("product_management_no_warehouse"),
      route: "/management/products",
    },
    { title: t("edit_product_breadcrumb"), route: "" },
  ];

  // state form
  const [selectBrand, setSelectBrand] = useState(product?.data?.brand_id || "");
  const [selectSupplier, setSelectSupplier] = useState(
    product?.data?.supplier_id || "",
  );
  const [selectCategory, setSelectCategory] = useState(
    product?.data?.category_id || "",
  );
  const [name, setName] = useState(product?.data?.name || "");
  const [thumbnail, setThumbnail] = useState(product?.data?.thumbnail || null);
  const [basePrice, setBasePrice] = useState(product?.data?.base_price || "");
  const [isActive, setIsActive] = useState(product?.data?.is_active ?? true);
  const [description, setDescription] = useState(
    product?.data?.description || "",
  );
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await productImageApi.getByProduct(product.data.id);
        if (res.success) {
          setProductImages(res.data || []);
        }
      } catch {
        // Không có ảnh hoặc lỗi
      }
    };
    if (product?.data?.id) {
      loadImages();
    }
  }, [product?.data?.id]);

  const brandsOptions = useMemo(
    () =>
      brands?.data?.map((brand) => ({
        id: brand.id,
        name: brand.name,
      })) || [],
    [brands?.data],
  );

  const suppliersOptions = useMemo(
    () =>
      suppliers?.data?.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
      })) || [],
    [suppliers?.data],
  );

  const categoriesOptions = useMemo(
    () =>
      categories?.data?.map((category) => ({
        id: category.id,
        name: category.name,
      })) || [],
    [categories?.data],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (thumbnail instanceof File) {
      formData.append("thumbnail", thumbnail);
    }
    formData.append("name", name);
    formData.append("base_price", basePrice);
    formData.append("is_active", isActive);
    formData.append("brand_id", selectBrand);
    formData.append("supplier_id", selectSupplier);
    formData.append("category_id", selectCategory);
    formData.append("description", description);

    try {
      const response = await productdApi.update(product.data.id, formData);
      if (response.success) {
        const newFiles = productImages.filter((img) => img instanceof File);
        const currentImageIds = productImages
          .filter((img) => !(img instanceof File))
          .map((img) => ({ id: img.id, is_primary: img.is_primary || false }));

        if (newFiles.length > 0) {
          const imageFormData = new FormData();
          newFiles.forEach((file) => imageFormData.append("url", file));
          imageFormData.append(
            "current_image_ids",
            JSON.stringify(currentImageIds),
          );
          await productImageApi.update(product.data.id, imageFormData);
        }

        await queryClient.invalidateQueries({ queryKey: ["products"] });
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

  return (
    <div className="animate-in fade-in duration-500 space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("edit_product_heading")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* CỘT TRÁI */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {/* Đã thêm relative và z-50 ở đây */}
          <div className="relative z-50 rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="amber">
              {t("system_classification")}
            </TitleManagement>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 mb-3">
              <div className="w-full sm:w-1/2">
                <SelectPro
                  value={selectBrand}
                  options={brandsOptions}
                  onChange={(val) => setSelectBrand(val)}
                  label={t("choose_brand")}
                />
              </div>
              <div className="w-full sm:w-1/2">
                <SelectPro
                  value={selectSupplier}
                  options={suppliersOptions}
                  onChange={(val) => setSelectSupplier(val)}
                  label={t("choose_supplier")}
                />
              </div>
            </div>
            <SelectPro
              value={selectCategory}
              options={categoriesOptions}
              onChange={(val) => setSelectCategory(val)}
              label={t("choose_category")}
            />
          </div>

          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="cyan">
              {t("thumbnail_title")}
            </TitleManagement>
            <div className="mt-3">
              <InputFile
                value={thumbnail}
                onChange={(file) => setThumbnail(file)}
              />
            </div>
          </div>

          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <div className="mt-1">
              <MultiFileUpload
                label={t("product_images_label")}
                value={productImages}
                onChange={setProductImages}
                maxFiles={10}
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="w-full lg:w-1/2 rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900 flex flex-col gap-4">
          <TitleManagement color="emerald">
            {t("product_info_title")}
          </TitleManagement>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="flex-1">
              <FloatingInput
                id="name"
                label={t("product_name_label")}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <FloatingInput
                id="base_price"
                label={t("base_price_vnd")}
                required
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <FloatingTextarea
              id="product_desc"
              label={t("product_desc_label")}
              placeholder={t("desc_placeholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required={true}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="border border-slate-200 dark:border-slate-800 w-full sm:w-[50%] p-3 rounded-lg bg-slate-50/50 dark:bg-[#111827]/40">
              <AnimatedCheckbox
                id="is_active_checkbox"
                label={isActive ? t("selling_label") : t("pause_label")}
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
