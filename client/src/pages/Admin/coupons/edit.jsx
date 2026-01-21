import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinhh doanh", route: "" },
  { title: "Khuyến mãi", route: "/management/coupons" },
  { title: "Chỉnh sữa mã khuyến mãi", route: "" },
];

const EditCouponPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">Edit</div>
    </>
  );
};

export default EditCouponPage;
