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
  // 1. Destructuring với giá trị mặc định để tránh crash
  const {
    orders = { data: [] },
    productVariants = { data: [] },
    purchases = { data: [] },
  } = useLoaderData() || {};

  console.log("=== DỮ LIỆU TỪ LOADER ===");
  console.log("Orders:", orders);
  console.log("Product Variants:", productVariants);
  console.log("Purchases:", purchases);

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold my-4 uppercase italic text-slate-800">
        Thêm tồn kho
      </h2>
      <FormStock
        orders={orders.data}
        variants={productVariants.data}
        purchases={purchases.data || purchases}
      />
    </>
  );
};

export default CreateStockPage;
