import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productAttributeKeyApi from "@/api/management/productAttributeKeyApi";
import LoaderProduct from "@/loaders/core/productLoader";
import LoaderAttr from "@/loaders/core/attributeKey";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const EditProductAttributeKey = () => {
  const { t } = useTranslation("translation", {
    keyPrefix: "productAttributeKey",
  });
  const { id } = useParams();
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: t("product_warehouse_management"), route: "" },
    {
      title: t("assignment_title"),
      route: "/management/product-attribute-key/",
    },
    { title: t("edit_breadcrumb"), route: "" },
  ];

  const [products, setProducts] = useState([]);
  const [attributeKeys, setAttributeKeys] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedAttributeKey, setSelectedAttributeKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      LoaderProduct.getProductsDropdown(),
      LoaderAttr.getAllAttributesDropdown(),
      productAttributeKeyApi.getById(id),
    ]).then(([prodRes, attrRes, itemRes]) => {
      if (prodRes?.data) setProducts(prodRes.data);
      if (attrRes?.data) setAttributeKeys(attrRes.data);
      if (itemRes?.success) {
        setSelectedProduct(itemRes.data.product_id);
        setSelectedAttributeKey(itemRes.data.attribute_key_id);
      }
      setLoading(false);
    });
  }, [id]);

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
      const response = await productAttributeKeyApi.update(id, {
        product_id: Number(selectedProduct),
        attribute_key_id: Number(selectedAttributeKey),
      });
      if (response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["product-attribute-keys"],
        });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || t("error_occurred"),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600 dark:text-slate-400">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-2xl bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200"
      >
        <TitleManagement color="blue">{t("edit_info_title")}</TitleManagement>
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

export default EditProductAttributeKey;
