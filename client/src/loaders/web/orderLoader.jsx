import orderApi from "@/api/customer/orderApi";
import LoaderOrder from "@/loaders/customer/orderLoader";

export async function ordersLoader({ request }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return { orders: [], pagination: null, user: null };

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;

  try {
    const res = await LoaderOrder.getAllOrders({ page, search: user.email });
    return {
      orders: res?.data?.orders || [],
      pagination: res?.data?.pagination || null,
      user,
    };
  } catch {
    return { orders: [], pagination: null, user };
  }
}

export async function orderDetailLoader({ params }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  try {
    const res = await LoaderOrder.getOrderById(params.id);
    return { order: res?.data || null, user };
  } catch {
    return { order: null, user };
  }
}
