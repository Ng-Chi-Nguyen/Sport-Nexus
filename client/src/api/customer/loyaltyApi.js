import axiosClient from "@/lib/axiosClient";

const loyaltyApi = {
  getMembership: () => axiosClient.get("/customer/loyalty/membership"),
  getRewards: () => axiosClient.get("/customer/loyalty/rewards"),
  getTransactions: () => axiosClient.get("/customer/loyalty/transactions"),
  redeemReward: (rewardId) =>
    axiosClient.post(`/customer/loyalty/rewards/${rewardId}/redeem`),
  applyPoints: (points) =>
    axiosClient.post("/customer/loyalty/apply-points", { points }),
};

export default loyaltyApi;
