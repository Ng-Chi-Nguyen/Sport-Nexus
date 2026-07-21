import axiosClient from "@/lib/axiosClient";

const productImageApi = {
  getByProduct: (productId) => {
    const url = `/core/product-image/product/${productId}`;
    return axiosClient.get(url);
  },

  create: (data) => {
    const url = "/core/product-image";
    return axiosClient.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (productId, data) => {
    const url = `/core/product-image/${productId}`;
    return axiosClient.put(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (imageId) => {
    const url = `/core/product-image/${imageId}`;
    return axiosClient.delete(url);
  },
};

export default productImageApi;
