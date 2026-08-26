import axiosClient from "@/lib/axiosClient";

const paymentApi = {
  getMethods: () => {
    const url = "/customer/payment/methods";
    return axiosClient.get(url);
  },

  createPayment: (orderId, data) => {
    const url = `/customer/payment/orders/${orderId}`;
    return axiosClient.post(url, data);
  },

  getOrderTransactions: (orderId) => {
    const url = `/customer/payment/orders/${orderId}/transactions`;
    return axiosClient.get(url);
  },

  getOrderStatus: (orderId) => {
    const url = `/customer/payment/orders/${orderId}/status`;
    return axiosClient.get(url);
  },

  getTransaction: (transactionId) => {
    const url = `/customer/payment/transactions/${transactionId}`;
    return axiosClient.get(url);
  },

  syncPayosPayment: (transactionId) => {
    const url = `/customer/payment/transactions/${transactionId}/sync-payos`;
    return axiosClient.post(url);
  },

  uploadReceipt: (transactionId, formData) => {
    const url = `/customer/payment/transactions/${transactionId}/receipt`;
    return axiosClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default paymentApi;
