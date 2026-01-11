import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Biến thể sản phẩm", route: "/management/product-variants" },
  { title: "Thêm mới", route: "#" },
];

const CreateProductVariant = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm mới biến thể sản phẩm</h2>
      <form></form>
    </>
  );
};

export default CreateProductVariant;
