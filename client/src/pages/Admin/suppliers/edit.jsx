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
    title: "Quản lý chuổi cung ứng",
    route: "",
  },
  {
    title: "Nhà cung cấp",
    route: "/management/brand",
  },
  {
    title: "Chỉnh sữa nhà cung cấp",
    route: "",
  },
];

const EditSupplierPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">Edit page</div>
    </>
  );
};

export default EditSupplierPage;
