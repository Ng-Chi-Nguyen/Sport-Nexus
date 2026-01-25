import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "#" },
];

const OrderPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm tồn kho..." />
        </div>
        <BtnAdd
          route={"/management/orders/create"}
          className="w-[30%]"
          name="Thêm tồn kho"
        />
      </div>
      <h2 className="my-4">Danh sách đơn hàng</h2>
    </>
  );
};

export default OrderPage;
