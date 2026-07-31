import CouponCard from "@/components/ui/couponCard";
import { SectionTitle } from "@/components/ui/title";
import { Tag } from "lucide-react";

export const CouponsSection = ({ coupons }) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <h2 className="mb-6 text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
        <Tag className="w-5 h-5 text-blue-600" />
        Mã giảm giá
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </div>
  );
};
