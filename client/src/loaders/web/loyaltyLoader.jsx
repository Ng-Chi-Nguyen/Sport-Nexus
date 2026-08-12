import loyaltyApi from "@/api/customer/loyaltyApi";

export async function loyaltyLoader() {
  try {
    const [r, tr] = await Promise.all([
      loyaltyApi.getRewards(),
      loyaltyApi.getTransactions(),
    ]);
    return {
      rewards: r?.data?.rewards ?? [],
      transactions: tr?.data?.transactions ?? [],
    };
  } catch {
    return { rewards: [], transactions: [] };
  }
}
