import addressApi from "@/api/customer/addressApi";

export async function addressLoader() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user?.id) return { addresses: [], user: null };
  try {
    const res = await addressApi.getAll(user.id);
    return { addresses: res?.data || [], user };
  } catch {
    return { addresses: [], user };
  }
}

export async function addressAction({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id");
    try {
      await addressApi.delete(id);
      return { ok: true, message: "Xoá địa chỉ thành công" };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Xoá địa chỉ thất bại",
      };
    }
  }

  if (intent === "set-default") {
    const id = formData.get("id");
    const userId = formData.get("userId");
    try {
      await addressApi.update(id, { is_default: true, user_id: userId });
      return { ok: true, message: "Đã đặt làm mặc định" };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Cập nhật thất bại",
      };
    }
  }

  return null;
}

export async function editAddressLoader({ params }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return { initialData: null, user: null };

  const res = await addressApi.getById(params.id);
  const addr = res?.data;
  if (!addr) return { initialData: null, user };

  const loc = addr.location_data || {};
  const initialData = {
    recipient_name: addr.recipient_name,
    recipient_phone: addr.recipient_phone,
    province: loc.province?.code?.toString().padStart(2, "0") || "",
    ward: loc.ward?.code?.toString().padStart(5, "0") || "",
    detail_address: addr.detail_address,
    type: addr.type || "home",
    is_default: addr.is_default,
  };

  return { initialData, user };
}
