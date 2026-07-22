import LoaderOrder from "@/loaders/customer/orderLoader";
import addressApi from "@/api/customer/addressApi";

export async function profileLoader() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return { user: null, orders: [], addresses: [] };

  const [ordersRes, addressesRes] = await Promise.all([
    LoaderOrder.getAllOrders({ page: 1, search: user.email }).catch(() => null),
    addressApi.getAll(user.id).catch(() => null),
  ]);

  return {
    user,
    orders: ordersRes?.data?.orders || [],
    addresses: addressesRes?.data || [],
  };
}
