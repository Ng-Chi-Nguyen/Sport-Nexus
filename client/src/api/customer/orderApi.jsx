import axiosClient from "@/lib/axiosClient";

const orderApi = {
  getItems: (orderId) => {
    const url = `/customer/order/${orderId}/items`;
    return axiosClient.get(url);
  },

  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `/customer/order${query ? `?${query}` : ""}`;
    return axiosClient.get(url);
  },

  getByEmail: (email) => {
    const url = `/customer/order/email/${encodeURIComponent(email)}`;
    return axiosClient.get(url);
  },

  create: (data) => {
    const url = "/customer/order";
    return axiosClient.post(url, data);
  },

  update: (orderId, data) => {
    const url = `/customer/order/${orderId}`;
    return axiosClient.put(url, data);
  },

  delete: (orderId) => {
    const url = `/customer/order/${orderId}`;
    return axiosClient.delete(url);
  },
};

export default orderApi;
