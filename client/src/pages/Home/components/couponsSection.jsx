import CouponCard from "@/components/ui/couponCard";

export const CouponsSection = ({ coupons }) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Mã giảm giá</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </section>
  );
};
