import axiosClient from "@/lib/axiosClient";

const stockMovementApi = {
  import: (data) => {
    const url = "/management/stock/import";
    return axiosClient.post(url, data);
  },

  export: (data) => {
    const url = "/management/stock/export";
    return axiosClient.post(url, data);
  },
};

export default stockMovementApi;
