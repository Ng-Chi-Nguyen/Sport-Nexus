import axiosClient from "@/api/axiosClient";

const LoaderUser = {
  getAllUsers: async (page = 1) => {
    const url = `/management/user?page=${page}`;
    const response = await axiosClient.get(url);
    return response;
  },
  getUserById: async ({ params }) => {
    const { userId } = params;
    const url = `/management/user/${userId}`;
    const response = await axiosClient.get(url);
    return response;
  },
};

export default LoaderUser;
