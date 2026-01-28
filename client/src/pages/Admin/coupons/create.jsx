import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard } from "lucide-react";

import { Submit_GoBack } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import { SelectPro } from "@/components/ui/select";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import couponApi from "@/api/management/couponApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinhh doanh", route: "" },
  { title: "Khuyến mãi", route: "/management/coupons" },
  { title: "Thêm mã khuyển mãi", route: "" },
];

const discountTypeOptions = [
  { id: "CASH", name: "Tiền mặt ($)" },
  { id: "PERCENTAGE", name: "Phần trăm (%)" },
];

const CreateCouponPage = () => {
  const navigate = useNavigate();
  // state form
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState(1);
  const [code, setCode] = useState("");
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(1);
  const [isActive, setIsActive] = useState(false);
  // end state form

  // console.log(discountType);

  const handleIsActiveChange = (checkedValue) => {
    setIsActive(checkedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      code: code,
      discount_value: Number(discountValue),
      discount_type: discountType,
      usage_limit: Number(usageLimit),
      max_discount: Number(maxDiscount),
      min_order_value: Number(minOrderValue),
      end_date: endDate,
      start_date: startDate,
      is_active: isActive,
    };
    // console.log(dataToSend);
    try {
      const response = await couponApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["coupons"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm mã khuyến mãi</h2>
      <form onSubmit={handleSubmit} className="flex gap-3 mt-2">
        <div className="flex flex-col gap-3">
          <div className="border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="emerald">Cấu hình giảm giá</TitleManagement>
            <SelectPro
              label="Chọn loại hình giảm giá"
              options={discountTypeOptions}
              value={discountType}
              onChange={(val) => setDiscountType(val)}
            />
            <div className="flex gap-3 my-4">
              <FloatingInput
                label="Giá trị giảm"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
              <FloatingInput
                label="Đơn hàng tối đa"
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </div>
          </div>
          <div className="border border-gray-200 rounded-[5px] p-3">
            <TitleManagement>Thông tin mã</TitleManagement>
            <div className="flex gap-4">
              <div className="w-1/2">
                <FloatingInput
                  label="Mã code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="p-[10px_15px] text-base rounded-lg border border-[#8d8d8d]">
                <AnimatedCheckbox
                  id="status"
                  label={isActive ? "Còn thời hạn" : "Hết hạn"}
                  checked={isActive}
                  onChange={(e) => handleIsActiveChange(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="orange">Khung thời gian</TitleManagement>
            <div className="flex gap-4">
              <FloatingInput
                label="Ngày bắt đầu"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <FloatingInput
                label="Ngày kết thúc"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="red">Điều kiện sữ dụng</TitleManagement>
            <div className="flex gap-4">
              <FloatingInput
                label="Đơn hàng tối thiểu"
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
              <FloatingInput
                label="Giới hạn sữ dụng"
                min={1}
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <Submit_GoBack justify="end" />
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateCouponPage;
