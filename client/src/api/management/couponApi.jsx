import axiosClient from "@/lib/axiosClient";

const couponApi = {
  create: (data) => {
    // console.log(data);
    const url = "/management/coupon";
    return axiosClient.post(url, data);
  },

  update: (couponId, data) => {
    // console.log(couponId);
    // console.log(data);
    const url = `/management/coupon/${couponId}`;
    return axiosClient.put(url, data);
  },

  delete: (couponId) => {
    // console.log(couponId);
    const url = `/management/coupon/${couponId}`;
    return axiosClient.delete(url);
  },

  check: (data) => {
    const url = `/management/coupon/check`;
    return axiosClient.post(url, data);
  },
};

export default couponApi;
