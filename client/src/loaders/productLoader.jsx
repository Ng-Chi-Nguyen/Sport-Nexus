import axiosClient from "@/lib/axiosClient";

const LoaderProduct = {
  getAllProducst: (page = 1) => {
    // console.log(page);
    const url = `core/product?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },

  getProductById: (productId) => {
    const url = `core/product/${productId}`;
    return axiosClient.get(url);
  },

  getProductsDropdown: () => {
    const url = `core/product/all`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderProduct;
