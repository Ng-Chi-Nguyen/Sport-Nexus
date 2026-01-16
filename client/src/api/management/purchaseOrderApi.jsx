import axiosClient from "@/lib/axiosClient";

const purchaseOrderdApi = {
  create: (data) => {
    const url = "/management/purchase-order";
    return axiosClient.post(url, data);
  },

  update: (purchaseId, data) => {
    // console.log(purchaseId);
    // console.log(data);
    const url = `/management/purchase-order/${purchaseId}`;
    return axiosClient.put(url, data);
  },

  delete: (purchaseId) => {
    const url = `/management/purchase-order/${purchaseId}`;
    return axiosClient.delete(url);
  },
};

export default purchaseOrderdApi;
