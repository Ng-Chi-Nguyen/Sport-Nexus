import axiosClient from "@/lib/axiosClient";

const reviewApi = {
  create: (formData) => {
    return axiosClient.post("/customer/review/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (reviewId, formData) => {
    return axiosClient.put(`/customer/review/${reviewId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getByProduct: (productId) => {
    return axiosClient.get(`/customer/review/product/${productId}`);
  },

  remove: (reviewId) => {
    return axiosClient.delete(`/customer/review/${reviewId}`);
  },
};

export default reviewApi;
