import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Biến thể sản phẩm", route: "#" },
];

const ProductVariant = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm chi tiết sản phẩm..." />
        </div>
        <BtnAdd
          route={"/management/product-variants/create"}
          className="w-[30%]"
          name="Thêm biến thể SP"
        />
      </div>
    </>
  );
};

export default ProductVariant;
