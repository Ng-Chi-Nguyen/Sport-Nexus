import axiosClient from "@/lib/axiosClient";

const LoaderLoyalty = {
  getUsers: async ({ page = 1, search = "", sortBy = "", order = "", tierId = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (search) params.set("search", search);
    if (sortBy) params.set("sortBy", sortBy);
    if (order) params.set("order", order);
    if (tierId) params.set("tierId", tierId);
    return axiosClient.get(`/management/loyalty/users?${params.toString()}`);
  },
  getUsersPage: async (params) => {
    const [usersRes, tiersRes] = await Promise.all([
      LoaderLoyalty.getUsers(params),
      axiosClient.get("/management/loyalty/tiers"),
    ]);
    return {
      ...usersRes?.data,
      tiers: tiersRes?.data?.tiers ?? [],
    };
  },
  getRewardsPage: async () => {
    const [rewards, tiers, hiddenCoupons] = await Promise.all([
      axiosClient.get("/management/loyalty/rewards"),
      axiosClient.get("/management/loyalty/tiers"),
      axiosClient.get("/management/loyalty/rewards/hidden-coupons"),
    ]);
    return {
      rewards: rewards?.data?.rewards ?? [],
      tiers: tiers?.data?.tiers ?? [],
      hiddenCoupons: hiddenCoupons?.data?.coupons ?? [],
    };
  },
};

export default LoaderLoyalty;
