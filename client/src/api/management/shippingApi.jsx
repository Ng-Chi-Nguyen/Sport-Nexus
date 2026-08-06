import axiosClient from "@/lib/axiosClient";

const shippingApi = {
  getAll: (params) => {
    const url = "/management/shipping";
    return axiosClient.get(url, { params });
  },

  getById: (id) => {
    const url = `/management/shipping/${id}`;
    return axiosClient.get(url);
  },
};

export default shippingApi;