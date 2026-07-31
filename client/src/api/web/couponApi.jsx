import axiosClient from "@/lib/axiosClient";

const couponApi = {
    getActiveCoupons: () => {
        const url = "/home/coupon/active";
        return axiosClient.get(url);
    },
    getCouponsByCodes: (codes) => {
        const url = `/home/coupon/list?codes=${codes.join(",")}`;
        return axiosClient.get(url);
    },
};

export default couponApi;
