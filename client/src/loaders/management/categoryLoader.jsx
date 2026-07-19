import axiosClient from "@/lib/axiosClient";

const LoaderCategory = {
  getAllCategories: async ({ page = 1, is_active = "", search = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (is_active !== "") params.set("is_active", is_active);
    if (search) params.set("search", search);
    try {
      const response = await axiosClient.get(
        `management/category?${params.toString()}`,
      );
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            list_categories: [],
            pagination: { totalPages: 1, currentPage: 1 },
          },
        };
      }
      throw error;
    }
  },

  getCategoryById: ({ params }) => {
    const { catrgoryId } = params;
    // console.log(catrgoryId);
    const url = `management/category/${catrgoryId}`;
    const response = axiosClient.get(url);
    return response;
  },

  getCategoriesDropdown: () => {
    // console.log(page);
    const url = `management/category/all`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderCategory;
