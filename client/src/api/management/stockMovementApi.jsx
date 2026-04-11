import axiosClient from "@/lib/axiosClient";

const stockMovementApi = {
  createBatch: (data) => {
    const url = "/management/stock/batch";
    return axiosClient.post(url, data);
  },
};

export default stockMovementApi;
