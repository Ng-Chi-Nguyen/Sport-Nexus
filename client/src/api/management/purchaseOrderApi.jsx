import axiosClient from "@/lib/axiosClient";

const purchaseOrderdApi = {
  getItems: (purchaseId) => {
    const url = `/management/purchase-order/${purchaseId}/items`; // Khớp với route /:id/items
    return axiosClient.get(url);
  },

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
