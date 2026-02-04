import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import { LayoutDashboard } from "lucide-react";
import FormStock from "./components/form";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Tồn kho", route: "/management/stocks" },
  { title: "Thêm tồn kho", route: "#" },
];

const CreateStockPage = () => {
  const handleSubmit = () => {};
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm tồn kho</h2>
      <FormStock />
    </>
  );
};

export default CreateStockPage;
