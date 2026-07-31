import CouponCard from "@/components/ui/couponCard";

export const CouponsSection = ({ coupons }) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
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
