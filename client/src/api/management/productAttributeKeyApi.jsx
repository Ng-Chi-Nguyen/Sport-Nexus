import axiosClient from "@/lib/axiosClient";

const productAttributeKeyApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.product_id) query.set('product_id', params.product_id);
        return axiosClient.get(`/management/product-attribute-key?${query.toString()}`);
    },

    getById: (id) => {
        return axiosClient.get(`/management/product-attribute-key/${id}`);
    },

    getByProduct: (productId) => {
        return axiosClient.get(`/management/product-attribute-key/by-product/${productId}`);
    },

    create: (data) => {
        return axiosClient.post('/management/product-attribute-key', data);
    },

    update: (id, data) => {
        return axiosClient.put(`/management/product-attribute-key/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`/management/product-attribute-key/${id}`);
    },
};

export default productAttributeKeyApi;
