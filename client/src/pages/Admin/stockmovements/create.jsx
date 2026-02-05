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
  const { orders, productVariants } = useLoaderData();
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm tồn kho</h2>
      <FormStock orders={orders.data} variants={productVariants.data} />
    </>
  );
};

export default CreateStockPage;
