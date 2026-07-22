import axiosClient from "@/api/axiosClient";

const cartApi = {
    getCart: () => axiosClient.get("/customer/cart/"),

    addItem: (data) => axiosClient.post("/customer/cart-item/", data),

    updateItem: (id, data) => axiosClient.put(`/customer/cart-item/${id}`, data),

    removeItem: (id) => axiosClient.delete(`/customer/cart-item/${id}`),

    syncCart: (items) => axiosClient.post("/customer/cart/sync", { items }),
};

export default cartApi;
