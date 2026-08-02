import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productAttributeKeyApi from "@/api/management/productAttributeKeyApi";
import LoaderProduct from "@/loaders/core/productLoader";
import LoaderAttr from "@/loaders/core/attributeKey";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const CreateProductAttributeKey = () => {
  const { t } = useTranslation("translation", {
    keyPrefix: "productAttributeKey",
  });
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: t("product_warehouse_management"), route: "" },
    {
      title: t("assignment_title"),
      route: "/management/product-attribute-key/",
    },
    { title: t("add_new_breadcrumb"), route: "" },
  ];

  const [products, setProducts] = useState([]);
  const [attributeKeys, setAttributeKeys] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedAttributeKey, setSelectedAttributeKey] = useState("");

  useEffect(() => {
    LoaderProduct.getProductsDropdown().then((res) => {
      if (res?.data) setProducts(res.data);
    });
    LoaderAttr.getAllAttributesDropdown().then((res) => {
      if (res?.data) setAttributeKeys(res.data);
    });
  }, []);

  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name })),
    [products],
  );

  const attrKeyOptions = useMemo(
    () =>
      attributeKeys.map((a) => ({
        id: a.id,
        name: `${a.name}${a.unit ? ` (${a.unit})` : ""}`,
      })),
    [attributeKeys],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await productAttributeKeyApi.create({
        product_id: Number(selectedProduct),
        attribute_key_id: Number(selectedAttributeKey),
      });
      if (response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["product-attribute-keys"],
        });
        ShowToast("success", response.message);
        navigate(-1);
      }
    } catch (error) {
      ShowToast(
        "error",
        error.response?.data?.message || error.message || t("error_occurred"),
      );
    }
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-2xl bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200"
      >
        <TitleManagement color="blue">{t("create_info_title")}</TitleManagement>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="flex-1">
            <SelectPro
              value={selectedProduct}
              options={productOptions}
              onChange={setSelectedProduct}
              label={t("select_product_label")}
            />
          </div>
          <div className="flex-1">
            <SelectPro
              value={selectedAttributeKey}
              options={attrKeyOptions}
              onChange={setSelectedAttributeKey}
              label={t("select_attribute_label")}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5">
          <Submit_GoBack />
        </div>
      </form>
    </div>
  );
};

export default CreateProductAttributeKey;
