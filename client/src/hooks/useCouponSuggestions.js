import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCoupons } from "@/contexts/CouponContext";
import webCouponApi from "@/api/web/couponApi";
import customerCouponApi from "@/api/customer/couponApi";

const useCouponSuggestions = () => {
  const { savedCodes } = useCoupons();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: ["saved-coupons", savedCodes.join(",")],
    queryFn: () => webCouponApi.getCouponsByCodes(savedCodes),
    enabled: savedCodes.length > 0,
  });

  const { data: giftedData, isLoading: giftedLoading } = useQuery({
    queryKey: ["gifted-coupons"],
    queryFn: () => customerCouponApi.getGifted(),
    enabled: isLoggedIn,
  });

  const suggestions = useMemo(() => {
    const map = new Map();
    const saved = savedData?.success ? savedData.data.coupons : [];
    const gifted = giftedData?.success ? giftedData.data.coupons : [];
    [...saved, ...gifted].forEach((c) => {
      if (c?.code) map.set(c.code, c);
    });
    return Array.from(map.values());
  }, [savedData, giftedData]);

  return {
    suggestions,
    isLoading: savedLoading || giftedLoading,
  };
};

export default useCouponSuggestions;
