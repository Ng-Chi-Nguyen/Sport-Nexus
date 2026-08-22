import axiosClient from "@/lib/axiosClient";

const LoaderReview = {
  getAllReviews: async ({
    page = 1,
    search = "",
    product_id = "",
    rating = "",
    status = "",
    reply = "",
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (search) params.set("search", search);
    if (product_id) params.set("product_id", product_id);
    if (rating) params.set("rating", rating);
    if (status) params.set("status", status);
    if (reply) params.set("reply", reply);
    try {
      const response = await axiosClient.get(
        `management/review?${params.toString()}`,
      );
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            reviews: [],
            pagination: { totalItems: 0, totalPages: 1, currentPage: 1 },
          },
        };
      }
      throw error;
    }
  },
};

export default LoaderReview;
