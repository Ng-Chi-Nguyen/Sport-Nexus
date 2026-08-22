import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard, PlusCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import productVariantdApi from "@/api/core/productVariantApi";
import ShowToast from "@/components/ui/toast";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";
import LoaderAttr from "@/loaders/core/attributeKey";

const EditProductVariant = () => {
  const { t } = useTranslation("translation", { keyPrefix: "productVariant" });
  const response = useLoaderData();
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("product_warehouse_management"), route: "" },
    { title: t("variant_items"), route: "/management/product-variants" },
    { title: t("edit_variant_breadcrumb"), route: "#" },
  ];

  const products = response.products.data;
  const product_variant = response.product_variant.data;

  const initialAttrs = (product_variant.VariableAttributes || []).map(
    (attr) => ({
      attribute_key_id: attr.attributeKey.id,
      value: attr.value,
    }),
  );

  const [selectProdut, setSelectProduct] = useState(product_variant.product_id);
  const [stock, setStock] = useState(product_variant.stock);
  const [price, setPrice] = useState(product_variant.price);
  const [attributes, setAttributes] = useState(
    initialAttrs.length > 0
      ? initialAttrs
      : [{ attribute_key_id: "", value: "" }],
  );
  const [assignedAttrKeys, setAssignedAttrKeys] = useState([]);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        name: product.name,
      })),
    [products],
  );

  const attributeKeyOptions = useMemo(
    () =>
      assignedAttrKeys.map((attrKey) => ({
        id: attrKey.id,
        name: attrKey.name,
      })),
    [assignedAttrKeys],
  );

  const usedAttrIds = attributes
    .map((a) => Number(a.attribute_key_id))
    .filter(Boolean);

  const availableAttrOptions = useMemo(
    () => attributeKeyOptions.filter((opt) => !usedAttrIds.includes(opt.id)),
    [attributeKeyOptions, usedAttrIds],
  );

  useEffect(() => {
    LoaderAttr.getAllAttributesDropdown()
      .then((res) => {
        if (res.success) {
          setAssignedAttrKeys(res.data || []);
        }
      })
      .catch(() => setAssignedAttrKeys([]));
  }, []);

  const handleProductChange = (productId) => {
    setSelectProduct(productId);
    setAttributes([{ attribute_key_id: "", value: "" }]);
  };

  const addAttributeRow = () => {
    setAttributes((prev) => [...prev, { attribute_key_id: "", value: "" }]);
  };

  const removeAttributeRow = (index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index, field, val) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: val } : attr)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validAttrs = attributes.filter(
      (attr) => attr.attribute_key_id && attr.value.trim(),
    );

    if (validAttrs.length === 0) {
      ShowToast("error", t("add_attribute_error"));
      return;
    }

    const dataToSend = {
      stock: Number(stock),
      price: Number(price),
      product_id: Number(selectProdut),
      attributes: validAttrs.map((attr) => ({
        attribute_key_id: Number(attr.attribute_key_id),
        value: attr.value.trim(),
      })),
    };

    try {
      const response = await productVariantdApi.update(
        product_variant.id,
        dataToSend,
      );
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["product-variants"] });
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
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("edit_variant_heading")}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 w-full">
        {/* CỘT TRÁI: GIÁ & KHO HÀNG */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md h-fit transition-colors duration-200">
          <TitleManagement color="green">
            {t("price_stock_title")}
          </TitleManagement>

          <div className="space-y-5 mt-2">
            <FloatingInput
              label={t("stock_quantity_label")}
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <FloatingInput
              label={t("variant_price_label")}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* CỘT PHẢI: CẤU HÌNH THUỘC TÍNH */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md relative z-20 transition-colors duration-200">
          <TitleManagement color="blue">
            {t("config_attributes_title")}
          </TitleManagement>
          <div className="w-full mb-5 mt-2">
            <SelectPro
              value={selectProdut}
              options={productOptions}
              onChange={handleProductChange}
              label={t("product_label")}
            />
          </div>

          <div className="space-y-3 mb-5">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <SelectPro
                    value={attr.attribute_key_id}
                    options={
                      attr.attribute_key_id
                        ? attributeKeyOptions
                        : availableAttrOptions
                    }
                    onChange={(val) =>
                      updateAttribute(index, "attribute_key_id", val)
                    }
                    label={t("attribute_label")}
                  />
                </div>
                <div className="flex-1">
                  <FloatingInput
                    label={t("value_label")}
                    value={attr.value}
                    onChange={(e) =>
                      updateAttribute(index, "value", e.target.value)
                    }
                  />
                </div>
                {attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttributeRow(index)}
                    className="mt-2 p-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {attributes.length < attributeKeyOptions.length && (
            <button
              type="button"
              onClick={addAttributeRow}
              className="flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-blue-400 hover:text-sky-700 dark:hover:text-blue-300 transition-colors mb-5"
            >
              <PlusCircle size={16} />
              {t("add_attribute_btn")}
            </button>
          )}

          <div className="flex justify-end border-t border-slate-200 dark:border-white/5 pt-5 w-full">
            <Submit_GoBack name={t("save_changes")} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductVariant;
