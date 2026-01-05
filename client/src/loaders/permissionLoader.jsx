import axiosClient from "@/api/axiosClient";

const LoaderPermissions = {
  getGroups: async (page = 1) => {
    const response = await axiosClient.get(
      `/management/permission/groups?page=${page}`
    );
    // console.log(response);
    return response; // Trả về cấu trúc { data, pagination }
  },
  getBySlug: async ({ params }) => {
    const { slug } = params;
    try {
      const response = await axiosClient.get(
        `/management/permission/slug/${slug}`
      );
      //   console.log(response);
      if (response.success) {
        return response.data;
      }
      return {};
    } catch (error) {
      console.error("Loader Error:", error);
      return {};
    }
  },

  getAllPermissions: async () => {
    try {
      const response = await axiosClient.get("/management/permission");
      if (response.success) {
        return response;
      }
      return [];
    } catch (error) {
      console.error("Loader Error (getAllPermissions):", error);
      return [];
    }
  },
};

export default LoaderPermissions;
