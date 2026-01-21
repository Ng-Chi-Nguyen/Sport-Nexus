import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";

import { Submit_GoBack } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import { SelectPro } from "@/components/ui/select";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinhh doanh", route: "" },
  { title: "Khuyến mãi", route: "/management/coupons" },
  { title: "Thêm mã khuyển mãi", route: "" },
];

const CreateCouponPage = () => {
  const handleSubmit = (e) => {};
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
        <div className="flex gap-3">
          <div className="w-1/2 border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="emerald">Cấu hình giảm giá</TitleManagement>
            <SelectPro />
            <FloatingInput label="Loại giảm giá" />
          </div>
          <div className="w-1/2 border border-gray-200 rounded-[5px] p-3">
            <TitleManagement>Thông tin mã</TitleManagement>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-1/2 border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="orange">Khung thời gian</TitleManagement>
          </div>
          <div className="w-1/2 border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="red">Điều kiện sữ dụng</TitleManagement>
          </div>
          {/* <Submit_GoBack /> */}
        </div>
      </form>
    </>
  );
};

export default CreateCouponPage;
