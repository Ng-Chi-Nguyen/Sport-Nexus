import axiosClient from "@/lib/axiosClient";

const LoaderCategory = {
  getAllCategories: (page = 1) => {
    // console.log(page);
    const url = `management/category?page=${page}`;
    const response = axiosClient.get(url);
    return response;
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
