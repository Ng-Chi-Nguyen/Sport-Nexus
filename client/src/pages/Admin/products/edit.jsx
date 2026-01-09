import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý sản phẩm & kho",
    route: "",
  },
  {
    title: "Sản phẩm",
    route: "managemant/products",
  },
  {
    title: "Chỉnh sữa",
    route: "",
  },
];

const EditProductPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chính sữa sản phẩm</h2>
    </>
  );
};

export default EditProductPage;
