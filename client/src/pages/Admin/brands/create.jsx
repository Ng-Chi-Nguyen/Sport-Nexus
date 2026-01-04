import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
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
    title: "Thương hiệu",
    route: "management/brands",
  },
  {
    title: "Thêm thương hiệu",
    route: "",
  },
];

const CreateBrandPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">
        <h2>Thêm thương hiệu</h2>
      </div>
    </>
  );
};

export default CreateBrandPage;
