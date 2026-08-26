import axiosClient from "@/lib/axiosClient";

const managementInvoiceApi = {
  getInvoiceDetail: (id) => axiosClient.get(`/management/invoice/${id}`),
  getInvoiceByOrderId: (orderId) =>
    axiosClient.get(`/management/invoice/order/${orderId}`),
};

export default managementInvoiceApi;
