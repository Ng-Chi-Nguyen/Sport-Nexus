import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";
import FormStock from "./components/form";
import { useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CreateStockPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "stockMovement" });
  const {
    orders = { data: [] },
    productVariants = { data: [] },
    purchases = { data: [] },
  } = useLoaderData() || {};

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: t("product_warehouse_management"), route: "" },
    { title: t("stock_title"), route: "/management/stocks" },
    { title: t("create_breadcrumb"), route: "#" },
  ];

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold my-4 uppercase italic text-slate-900 dark:text-slate-100">
        {t("create_heading")}
      </h2>
      <FormStock
        orders={orders.data}
        variants={productVariants.data}
        purchases={purchases.data || purchases}
      />
    </div>
  );
};

export default CreateStockPage;
