import axios from "axios";
import axiosClient from "../axiosClient";
const api_prefix_v1 = import.meta.env.VITE_API_URL;
const authApi = {
  create: (data) => {
    const url = `${api_prefix_v1}/auth/register/`;
    return axios.post(url, data);
  },
  login: (data) => {
    const url = `${api_prefix_v1}/auth/login/`;
    return axios.post(url, data);
  },
  logout: (userId) => {
    // console.log(userId);
    const url = `/auth/logout/${userId}`;
    return axiosClient.post(url);
  },
};

export default authApi;
