import { useState } from "react";
import CouponCard from "@/components/ui/couponCard";
import { TitleWithIcon } from "@/components/ui/title";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CarouselPagination } from "@/components/ui/pagination";

export const CouponsSection = ({ coupons }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 8;

  if (!coupons || coupons.length === 0) return null;

  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const displayedCoupons = coupons.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 mt-20 border-b border-blue-600">
      {/* Tiêu đề giữ nguyên ở trên */}
      <div className="flex items-center justify-between">
        <TitleWithIcon icon={Tag} title={t("discount_coupons")} />
      </div>

      {/* Danh sách coupon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCoupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} showPrint={false} />
        ))}
      </div>

      {/* Khu vực chứa thanh tiến trình và nút bấm ngang hàng ở phía dưới */}
      <CarouselPagination
        className="my-5"
        totalPages={totalPages}
        current={currentIndex}
        onChange={setCurrentIndex}
      />
    </div>
  );
};

export default CouponsSection;
