import axiosClient from "@/lib/axiosClient";

const LoaderCoupon = {
  getAllCoupons: (page = 1) => {
    // console.log(page);
    const url = `management/coupon?page=${page}`;
    return axiosClient.get(url);
  },

  getCouponById: ({ params }) => {
    const { catrgoryId } = params;
    // console.log(catrgoryId);
    const url = `management/coupon/${catrgoryId}`;
    return axiosClient.get(url);
  },
};

export default LoaderCoupon;
