import axiosClient from "@/lib/axiosClient";

const LoaderCoupon = {
  getAllCoupons: async ({ page = 1, is_active = "", search = "", discount_type = "", date_from = "", date_to = "", discount_min = "", discount_max = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (is_active !== "") params.set("is_active", is_active);
    if (search !== "") params.set("search", search);
    if (discount_type !== "") params.set("discount_type", discount_type);
    if (date_from !== "") params.set("date_from", date_from);
    if (date_to !== "") params.set("date_to", date_to);
    if (discount_min !== "") params.set("discount_min", discount_min);
    if (discount_max !== "") params.set("discount_max", discount_max);

    const url = `management/coupon?${params.toString()}`;

    try {
      const response = await axiosClient.get(url);
      return response;
    } catch (error) {
      // Chặn lỗi 404 khi bộ lọc hoặc từ khóa tìm kiếm không trả về kết quả nào
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            list_coupons: [], // Trả về mảng rỗng để giao diện hiển thị "Không tìm thấy..." thay vì crash
            pagination: {
              totalPages: 1,
              currentPage: 1,
            },
          },
        };
      }
      throw error; // Các lỗi khác (500, mất mạng...) vẫn cho báo lỗi
    }
  },

  getCouponById: (couponId) => {
    const url = `management/coupon/${couponId}`;
    return axiosClient.get(url);
  },
};

export default LoaderCoupon;
