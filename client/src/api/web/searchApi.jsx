import axiosClient from "@/lib/axiosClient";

const searchApi = {
    searchProducts: ({ q, limit, page }) => {
        const url = "/home/product/search";
        return axiosClient.get(url, { params: { q, limit, page } });
    },
    getProductsByIds: (ids) => {
        const url = "/home/product/by-ids";
        return axiosClient.get(url, { params: { ids: ids.join(",") } });
    },
};

export default searchApi;
