import axiosClient from "@/lib/axiosClient";

const loyaltyApi = {
  // Tiers
  getTiers: () => axiosClient.get("/management/loyalty/tiers"),
  createTier: (data) => axiosClient.post("/management/loyalty/tiers", data),
  updateTier: (id, data) => axiosClient.put(`/management/loyalty/tiers/${id}`, data),
  deleteTier: (id) => axiosClient.delete(`/management/loyalty/tiers/${id}`),

  // Rewards
  getRewards: () => axiosClient.get("/management/loyalty/rewards"),
  createReward: (data) => axiosClient.post("/management/loyalty/rewards", data),
  updateReward: (id, data) => axiosClient.put(`/management/loyalty/rewards/${id}`, data),
  deleteReward: (id) => axiosClient.delete(`/management/loyalty/rewards/${id}`),

  // Settings
  getSettings: () => axiosClient.get("/management/loyalty/settings"),
  updateSettings: (data) => axiosClient.put("/management/loyalty/settings", data),

  // Users
  getUsers: (params) => axiosClient.get("/management/loyalty/users", { params }),
  getUserDetail: (id) => axiosClient.get(`/management/loyalty/users/${id}`),
  adjustPoints: (id, data) =>
    axiosClient.post(`/management/loyalty/users/${id}/adjust-points`, data),
};

export default loyaltyApi;
