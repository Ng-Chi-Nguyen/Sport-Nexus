import axiosClient from "@/lib/axiosClient";

const LoaderCollection = {
  getAllCollections: async ({ page = 1, is_active = "", search = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (is_active !== "") params.set("is_active", is_active);
    if (search) params.set("search", search);
    try {
      const response = await axiosClient.get(
        `management/collection?${params.toString()}`,
      );
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            list_collections: [],
            pagination: { totalPages: 1, currentPage: 1 },
          },
        };
      }
      throw error;
    }
  },

  getCollectionById: ({ params }) => {
    const { collectionId } = params;
    const url = `management/collection/${collectionId}`;
    return axiosClient.get(url);
  },
};

export default LoaderCollection;
