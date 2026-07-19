import axiosClient from "@/lib/axiosClient";

const LoaderStock = {
  getAllStocks: async ({ page = 1, search = '', product_id, stock_min, stock_max, price_min, price_max } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) params.set('search', search);
    if (product_id) params.set('product_id', product_id);
    if (stock_min) params.set('stock_min', stock_min);
    if (stock_max) params.set('stock_max', stock_max);
    if (price_min) params.set('price_min', price_min);
    if (price_max) params.set('price_max', price_max);
    try {
      const response = await axiosClient.get(`management/stock?${params.toString()}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: { list_stocks: [], pagination: { totalPages: 1, currentPage: 1 } } };
      }
      throw error;
    }
  },
};

export default LoaderStock;
