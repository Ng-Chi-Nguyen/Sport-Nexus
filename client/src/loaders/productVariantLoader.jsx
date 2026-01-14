import axiosClient from "@/lib/axiosClient";

const LoaderProductVariant = {
  getAllProducstVariants: (page = 1) => {
    // console.log(page);
    const url = `core/product-variant?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },

  getProductVariantById: (variantId) => {
    // console.log(variantId);
    const url = `core/product-variant/${variantId}`;
    return axiosClient.get(url);
  },

  getProductsDropdown: () => {
    const url = `core/product/all`;
    const response = axiosClient.get(url);
    return response;
  },

  getProductVariantsDropdown: () => {
    const url = `core/product-variant/all`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderProductVariant;
