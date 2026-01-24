import axiosClient from "@/lib/axiosClient";

const LoaderCoupon = {
  getAllCoupons: (page = 1) => {
    // console.log(page);
    const url = `management/coupon?page=${page}`;
    return axiosClient.get(url);
  },

  getCouponById: (couponId) => {
    // console.log(catrgoryId);
    const url = `management/coupon/${couponId}`;
    return axiosClient.get(url);
  },
};

export default LoaderCoupon;
