import { LayoutDashboard } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
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
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Khuyến mãi", route: "/management/coupons" },
  { title: "Thêm mã khuyến mãi", route: "" },
];

const discountTypeOptions = [
  { id: "CASH", name: "Tiền mặt (đ)" },
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
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        Thêm mã khuyến mãi
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* CỘT TRÁI */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
          {/* CARD: CẤU HÌNH GIẢM GIÁ */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="emerald">Cấu hình giảm giá</TitleManagement>
            <div className="mt-3">
              <SelectPro
                label="Chọn loại hình giảm giá"
                options={discountTypeOptions}
                value={discountType}
                onChange={(val) => setDiscountType(val)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <FloatingInput
                label="Giá trị giảm"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
              <FloatingInput
                label="Giảm tối đa"
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </div>
          </div>

          {/* CARD: THÔNG TIN MÃ */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement>Thông tin mã</TitleManagement>
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-3">
              <div className="w-full sm:w-1/2">
                <FloatingInput
                  label="Mã code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/2 px-4 py-3 rounded-lg border transition-colors duration-200 bg-slate-50 border-slate-200 dark:bg-[#111827]/40 dark:border-slate-800">
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

        {/* CỘT PHẢI */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
          {/* CARD: KHUNG THỜI GIAN */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="orange">Khung thời gian</TitleManagement>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
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

          {/* CARD: ĐIỀU KIỆN SỬ DỤNG */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="red">Điều kiện sử dụng</TitleManagement>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <FloatingInput
                label="Đơn hàng tối thiểu"
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
              <FloatingInput
                label="Giới hạn sử dụng"
                min={1}
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <Submit_GoBack justify="end" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCouponPage;
