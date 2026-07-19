import axiosClient from "@/lib/axiosClient";

const LoaderPurchase = {
  getAllPurchases: ({ page = 1, status = '', supplier_id = '', date_from = '', date_to = '', cost_min = '', cost_max = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (status) params.set('status', status);
    if (supplier_id) params.set('supplier_id', supplier_id);
    if (date_from) params.set('date_from', date_from);
    if (date_to) params.set('date_to', date_to);
    if (cost_min) params.set('cost_min', cost_min);
    if (cost_max) params.set('cost_max', cost_max);
    if (search) params.set('search', search);
    return axiosClient.get(`management/purchase-order?${params.toString()}`);
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
