import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import { LayoutDashboard } from "lucide-react";

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
      <form
        onSubmit={handleSubmit}
        className="flex items-start w-fit p-4 gap-3"
      >
        <div className="flex flex-col gap-3 border border-gray-200 rounded-[5px] p-3">
          <TitleManagement>Thông tin danh mục</TitleManagement>
          <FloatingInput
            id="name"
            label="Tên danh mục"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Submit_GoBack />
        </div>
      </form>
    </>
  );
};

export default CreateStockPage;
