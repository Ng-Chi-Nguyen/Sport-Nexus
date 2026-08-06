import { useState, useCallback } from "react";
import couponApi from "@/api/customer/couponApi";
import { formatCurrency } from "@/utils/formatters";

const useCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyCoupon = useCallback(async (amount, code) => {
    if (!code.trim()) return;

    if (!localStorage.getItem("accessToken")) {
      setCouponData(null);
      setCouponMsg({
        type: "error",
        text: "Vui lòng đăng nhập để dùng mã giảm giá",
      });
      return;
    }

    setLoading(true);
    setCouponMsg(null);

    try {
      const res = await couponApi.check({ amount, code });

      if (res.data?.discount !== undefined) {
        setCouponData(res.data);
        setCouponMsg({
          type: "success",
          text: "Áp dụng mã giảm giá thành công",
        });
      } else {
        setCouponData(null);
        const minOrder = res.data?.min_order_value;
        setCouponMsg({
          type: "error",
          text:
            minOrder !== undefined && minOrder !== null
              ? `Đơn hàng giá tối thiểu là ${formatCurrency(minOrder)} mới có hiệu lực`
              : res.data?.message || "Mã giảm giá không hợp lệ",
        });
      }
    } catch (error) {
      setCouponData(null);
      const minOrder =
        error.response?.data?.min_order_value ??
        error.response?.data?.data?.min_order_value;
      setCouponMsg({
        type: "error",
        text:
          minOrder !== undefined && minOrder !== null
            ? `Đơn hàng giá tối thiểu là ${formatCurrency(minOrder)} mới có hiệu lực`
            : error.response?.data?.message ||
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

  return {
    couponCode,
    setCouponCode,
    couponMsg,
    couponData,
    loading,
    applyCoupon,
    clearCoupon,
  };
};

export default useCoupon;