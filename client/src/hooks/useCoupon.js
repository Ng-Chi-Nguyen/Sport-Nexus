import { useState, useCallback } from "react";
import couponApi from "@/api/management/couponApi";

const useCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyCoupon = useCallback(async (amount, code) => {
    if (!code.trim()) return;

    setLoading(true);
    setCouponMsg(null);

    try {
      const res = await couponApi.check({ amount, code });

      if (res.data?.discount !== undefined) {
        setCouponData(res.data);
        setCouponMsg({ type: "success", text: "Áp dụng mã giảm giá thành công" });
      } else {
        setCouponData(null);
        setCouponMsg({ type: "error", text: res.data?.message || "Mã giảm giá không hợp lệ" });
      }
    } catch (error) {
      setCouponData(null);
      setCouponMsg({
        type: "error",
        text:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          error.message ||
          "Đã có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCoupon = useCallback(() => {
    setCouponData(null);
    setCouponMsg(null);
  }, []);

  return { couponCode, setCouponCode, couponMsg, couponData, loading, applyCoupon, clearCoupon };
};

export default useCoupon;
