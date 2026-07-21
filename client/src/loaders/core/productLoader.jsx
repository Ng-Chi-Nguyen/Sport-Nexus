import axiosClient from "@/lib/axiosClient";

const LoaderProduct = {
  getAllProducts: async ({
    page = 1,
    search = "",
    is_active,
    category_id,
    brand_id,
    supplier_id,
    price_min,
    price_max,
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (search) params.set("search", search);
    if (is_active !== undefined && is_active !== "")
      params.set("is_active", is_active);
    if (category_id) params.set("category_id", category_id);
    if (brand_id) params.set("brand_id", brand_id);
    if (supplier_id) params.set("supplier_id", supplier_id);
    if (price_min) params.set("price_min", price_min);
    if (price_max) params.set("price_max", price_max);
    try {
      const response = await axiosClient.get(
        `core/product?${params.toString()}`,
      );
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            list_products: [],
            pagination: { totalPages: 1, currentPage: 1 },
          },
        };
      }
      throw error;
    }
  },

  getProductById: (productId) => {
    const url = `core/product/${productId}`;
    return axiosClient.get(url);
  },

  getProductBySlug: (slug) => {
    const url = `core/product/slug/${slug}`;
    console.log("url: ", url);
    return axiosClient.get(url);
  },

  getProductsDropdown: () => {
    const url = `core/product/all`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderProduct;
