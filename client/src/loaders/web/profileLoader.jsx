import orderApi from "@/api/customer/orderApi";
import addressApi from "@/api/customer/addressApi";

export async function profileLoader() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return { user: null, orders: [], addresses: [] };

  const [ordersRes, addressesRes] = await Promise.all([
    orderApi.getByEmail(user.email).catch(() => null),
    addressApi.getAll(user.id).catch(() => null),
  ]);

  return {
    user,
    orders: ordersRes?.data?.data || [],
    addresses: addressesRes?.data || [],
  };
}
