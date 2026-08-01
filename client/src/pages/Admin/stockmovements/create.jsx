import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";
import FormStock from "./components/form";
import { useLoaderData } from "react-router-dom";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Tồn kho", route: "/management/stocks" },
  { title: "Thêm tồn kho", route: "#" },
];

const CreateStockPage = () => {
  const {
    orders = { data: [] },
    productVariants = { data: [] },
    purchases = { data: [] },
  } = useLoaderData() || {};

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold my-4 uppercase italic text-slate-900 dark:text-slate-100">
        Thêm tồn kho
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
