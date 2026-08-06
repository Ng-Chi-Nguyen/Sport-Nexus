import axiosClient from "@/lib/axiosClient";

const shippingApi = {
  calculate: (data) => {
    const url = "/customer/shipping/calculate";
    return axiosClient.post(url, data);
  },

  track: (trackingCode) => {
    const url = `/customer/shipping/track/${trackingCode}`;
    return axiosClient.get(url);
  },
};

export default shippingApi;