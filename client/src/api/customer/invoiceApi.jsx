import axiosClient from "@/lib/axiosClient";

const invoiceApi = {
  getInvoices: (query) => {
    const url = `/customer/invoice${query ? `?${query}` : ""}`;
    return axiosClient.get(url);
  },
  getInvoiceDetail: (id) => {
    const url = `/customer/invoice/${id}`;
    return axiosClient.get(url);
  },
};

export default invoiceApi;
