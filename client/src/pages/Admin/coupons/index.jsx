import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinhh doanh", route: "" },
  { title: "Khuyến mãi", route: "" },
];

const CouponPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm quyền hạn..." />
        </div>
        <BtnAdd
          route={"/management/coupons/create"}
          className="w-[30%]"
          name="Thêm khuyển mãi"
        />
      </div>
    </>
  );
};

export default CouponPage;
