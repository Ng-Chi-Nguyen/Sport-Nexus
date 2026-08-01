import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import couponApi from "@/api/web/couponApi";
import { useCoupons } from "@/contexts/CouponContext";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import CouponCard from "@/components/ui/couponCard";

const CouponsPage = () => {
  const { savedCodes } = useCoupons();

  const { data, isLoading } = useQuery({
    queryKey: ["saved-coupons", savedCodes.join(",")],
    queryFn: () => couponApi.getCouponsByCodes(savedCodes),
    enabled: savedCodes.length > 0,
  });

  const coupons = data?.success ? data.data.coupons : [];

  if (savedCodes.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
          <Breadcrumbs
            data={[
              { title: "Trang chủ", route: "/" },
              { title: "Mã của tôi", route: "" },
            ]}
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Chưa lưu mã giảm giá nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ghé trang chủ và bấm "Lưu mã" trên các mã giảm giá để dùng sau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Mã của tôi", route: "" },
          ]}
        />

        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Mã của tôi ({savedCodes.length})
        </h1>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Chưa lưu mã giảm giá nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ghé trang chủ và bấm "Lưu mã" trên các mã giảm giá để dùng sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
