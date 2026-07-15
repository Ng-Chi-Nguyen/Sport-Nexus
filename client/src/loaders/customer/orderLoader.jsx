import axiosClient from "@/lib/axiosClient";

const LoaderOrder = {
  getAllOrders: async ({
    page = 1,
    status = "",
    payment_status = "",
    payment_method = "",
    date_from = "",
    date_to = "",
    amount_min = "",
    amount_max = "",
    search = "",
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);

    // ĐÃ XÓA dòng const search = url.searchParams.get("search") bị lỗi ở đây

    if (status) params.set("status", status);
    if (payment_status) params.set("payment_status", payment_status);
    if (payment_method) params.set("payment_method", payment_method);
    if (date_from) params.set("date_from", date_from);
    if (date_to) params.set("date_to", date_to);
    if (amount_min) params.set("amount_min", amount_min);
    if (amount_max) params.set("amount_max", amount_max);
    if (search) params.set("search", search);

    try {
      const response = await axiosClient.get(
        `customer/order?${params.toString()}`,
      );
      return response;
    } catch (error) {
      // Chặn lỗi 404 từ backend khi bộ lọc trả về danh sách rỗng để tránh sập trang
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            orders: [],
            pagination: {
              totalPages: 1,
              currentPage: 1,
            },
          },
        };
      }
      throw error;
    }
  },

  getOrderById: (orderId) => {
    const url = `customer/order/${orderId}`;
    const response = axiosClient.get(url);
    return response;
  },

  getOrderDropdowns: () => {
    const url = `customer/order/all-dropdown`;
    return axiosClient.get(url);
  },
};

export default LoaderOrder;
