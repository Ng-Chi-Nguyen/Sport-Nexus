import axiosClient from "@/lib/axiosClient";

const couponApi = {
  check: (data) => {
    const url = "/customer/coupon/check";
    return axiosClient.post(url, data);
  },
  getGifted: () => {
    const url = "/customer/coupon/gifted";
    return axiosClient.get(url);
  },
};

export default couponApi;