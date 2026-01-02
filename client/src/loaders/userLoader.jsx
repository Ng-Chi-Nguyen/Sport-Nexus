import axiosClient from "@/api/axiosClient";

const LoaderUsser = {
  getAllUsers: async (page = 1) => {
    const url = `/management/user?page=${page}`;
    const reponse = await axiosClient.get(url);
    return reponse;
  },
};

export default LoaderUsser;
