import axiosClient from "@/lib/axiosClient";

const productdApi = {
  create: (data) => {
    const url = "/core/product";
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (productId, data) => {
    // console.log(supplierId);
    // console.log(data);
    const url = `/core/product/${productId}`;
    return axiosClient.put(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (productId) => {
    const url = `/core/product/${productId}`;
    return axiosClient.delete(url);
  },
};

export default productdApi;
