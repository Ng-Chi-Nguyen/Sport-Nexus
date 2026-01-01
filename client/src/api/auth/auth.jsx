import axiosClient from "../axiosClient";

const authApi = {
  create: (data) => {
    const url = "/management/user/";
    return axiosClient.post(url, data);
  },
  login: (data) => {
    const url = "/auth/login/";
    return axiosClient.post(url, data);
  },
  logout: (userId) => {
    console.log(userId);
    const url = `/auth/logout/${userId}`;
    return axiosClient.post(url);
  },
};

export default authApi;
