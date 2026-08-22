import axiosClient from "@/lib/axiosClient";

const reviewApi = {
  reply: (reviewId, data) => {
    return axiosClient.put(`/management/review/${reviewId}/reply`, data);
  },

  deleteReply: (reviewId) => {
    return axiosClient.delete(`/management/review/${reviewId}/reply`);
  },

  setVisibility: (reviewId, is_hidden) => {
    return axiosClient.put(`/management/review/${reviewId}/visibility`, {
      is_hidden,
    });
  },
};

export default reviewApi;
