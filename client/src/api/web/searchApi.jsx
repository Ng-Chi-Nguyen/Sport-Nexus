import axiosClient from "@/lib/axiosClient";

const searchApi = {
    searchProducts: ({ q, limit, page }) => {
        const url = "/home/product/search";
        return axiosClient.get(url, { params: { q, limit, page } });
    },
};

export default searchApi;
