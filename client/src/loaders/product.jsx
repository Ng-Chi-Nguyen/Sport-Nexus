import axiosClient from "@/lib/axiosClient";

const LoaderProduct = {
  getAllProducst: (page = 1) => {
    // console.log(page);
    const url = `core/product?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },

  getProductsById: ({ params }) => {
    const { productId } = params;
    const url = `core/product/${productId}`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderProduct;
