import axiosClient from "@/lib/axiosClient";

const productVariantdApi = {
  create: (data) => {
    const url = "/core/product-variant";
    return axiosClient.post(url, data);
  },

  update: (variantId, data) => {
    // console.log(supplierId);
    // console.log(data);
    const url = `/core/product-variant/${variantId}`;
    return axiosClient.put(url, data);
  },

  delete: (variantId) => {
    const url = `/core/product-variant/${variantId}`;
    return axiosClient.delete(url);
  },
};

export default productVariantdApi;
