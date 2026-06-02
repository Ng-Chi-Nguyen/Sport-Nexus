import axiosClient from "@/lib/axiosClient";

const orderApi = {
  getItems: (orderId) => {
    const url = `/customer/order/${orderId}/items`;
    return axiosClient.get(url);
  },

  create: (data) => {
    const url = "/customer/order";
    return axiosClient.post(url, data);
  },

  update: (orderId, data) => {
    // console.log(orderId);
    const url = `/customer/order/${orderId}`;
    return axiosClient.put(url, data);
  },

  delete: (orderId) => {
    // console.log(orderId);
    const url = `/customer/order/${orderId}`;
    return axiosClient.delete(url);
  },
};

export default orderApi;
