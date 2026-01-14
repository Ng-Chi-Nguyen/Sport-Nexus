import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuổi cung ứng", route: "" },
  { title: "Nhập hàng", route: "" },
];

const PurchaseOrderPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm chi tiết sản phẩm..." />
        </div>
        <BtnAdd
          route={"/management/purchase/create"}
          className="w-[30%]"
          name="Thêm đơn nhập hàng"
        />
      </div>
      <h2 className="my-3">Danh sách nhập hàng</h2>
    </>
  );
};

export default PurchaseOrderPage;
