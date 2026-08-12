import { useQuery } from "@tanstack/react-query";
import { Bookmark, Gift, Ticket, X } from "lucide-react";
import webCouponApi from "@/api/web/couponApi";
import customerCouponApi from "@/api/customer/couponApi";
import { useCoupons } from "@/contexts/CouponContext";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import CouponCard from "@/components/ui/couponCard";
import { TitleWithIcon } from "@/components/ui/title";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const CouponsPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "coupon" });
  const { savedCodes } = useCoupons();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const [dismissedGifted, setDismissedGifted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissed-gifted-coupons") || "[]");
    } catch {
      return [];
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["saved-coupons", savedCodes.join(",")],
    queryFn: () => webCouponApi.getCouponsByCodes(savedCodes),
    enabled: savedCodes.length > 0,
  });

  const { data: giftedData, isLoading: giftedLoading } = useQuery({
    queryKey: ["gifted-coupons"],
    queryFn: () => customerCouponApi.getGifted(),
    enabled: isLoggedIn,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const coupons = data?.success ? data.data.coupons : [];
  const giftedCoupons = (
    isLoggedIn && giftedData?.success ? giftedData.data.coupons : []
  ).filter((c) => {
    if (!dismissedGifted.includes(c.code)) return true;
    return (c.quantity ?? 0) > 0;
  });

  const dismissGifted = (code) => {
    const next = [...dismissedGifted, code];
    setDismissedGifted(next);
    try {
      localStorage.setItem("dismissed-gifted-coupons", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: t("home"), route: "/" },
            { title: t("my_coupons"), route: "" },
          ]}
        />

        {giftedCoupons.length > 0 && (
          <div className="mb-8">
            <TitleWithIcon
              icon={Gift}
              title={`${t("gifted_coupons")} (${giftedCoupons.length})`}
            />
            {giftedLoading ? (
              <div className="py-10 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {giftedCoupons.map((coupon) => (
                  <div key={coupon.id} className="relative">
                    <button
                      type="button"
                      onClick={() => dismissGifted(coupon.code)}
                      title={t("remove_gifted")}
                      className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    <CouponCard coupon={coupon} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <TitleWithIcon
          icon={Ticket}
          title={`${t("my_coupons")} (${savedCodes.length})`}
        />

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : savedCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {t("no_saved_coupons")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("save_coupon_hint")}
            </p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {t("no_saved_coupons")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("save_coupon_hint")}
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
