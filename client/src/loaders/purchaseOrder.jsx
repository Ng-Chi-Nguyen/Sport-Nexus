import axiosClient from "@/lib/axiosClient";

const LoaderPurchase = {
  getAllPurchases: (page = 1) => {
    // console.log(page);
    const url = `management/purchase-order?page=${page}`;
    return axiosClient.get(url);
  },

  getPurchaseById: (PurchaseId) => {
    const url = `management/purchase-order/${PurchaseId}`;
    return axiosClient.get(url);
  },

  getPurchasesDropdown: () => {
    const url = `management/purchase-order/dropdown`;
    return axiosClient.get(url);
  },
};

export default LoaderPurchase;
