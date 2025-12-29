import axiosClient from "@/api/axiosClient";

const LoaderPermissions = {
  getGroups: async () => {
    try {
      const response = await axiosClient.get("/management/permission/groups");
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
};

export { LoaderPermissions };
