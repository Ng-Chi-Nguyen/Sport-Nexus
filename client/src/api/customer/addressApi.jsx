import axiosClient from "@/lib/axiosClient";

const addressApi = {
  getAll: (userId) => {
    const url = `customer/user-address/user/${userId}`;
    return axiosClient.get(url);
  },

  getById: (id) => {
    const url = `customer/user-address/${id}`;
    return axiosClient.get(url);
  },

  create: (data) => {
    const url = "customer/user-address/";
    return axiosClient.post(url, data);
  },

  update: (id, data) => {
    const url = `customer/user-address/${id}`;
    return axiosClient.put(url, data);
  },

  delete: (id) => {
    const url = `customer/user-address/${id}`;
    return axiosClient.delete(url);
  },
};

export default addressApi;
