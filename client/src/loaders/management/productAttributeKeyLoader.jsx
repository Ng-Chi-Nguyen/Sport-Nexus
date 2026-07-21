import axiosClient from "@/lib/axiosClient";

const LoaderProductAttributeKey = {
    getAll: async ({ page = 1, product_id = '' } = {}) => {
        const params = new URLSearchParams();
        params.set('page', page);
        if (product_id) params.set('product_id', product_id);
        try {
            const response = await axiosClient.get(`management/product-attribute-key?${params.toString()}`);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return { success: true, data: { data: [], pagination: { totalPages: 1, currentPage: 1 } } };
            }
            throw error;
        }
    },

    getById: (id) => {
        return axiosClient.get(`management/product-attribute-key/${id}`);
    },

    getByProduct: (productId) => {
        return axiosClient.get(`management/product-attribute-key/by-product/${productId}`);
    },
};

export default LoaderProductAttributeKey;
