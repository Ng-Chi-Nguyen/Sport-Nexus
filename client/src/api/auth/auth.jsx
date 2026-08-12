import axios from "axios";
import axiosClient from "../../lib/axiosClient";
const api_prefix_v1 = import.meta.env.VITE_API_URL;
const ngrokHeaders = api_prefix_v1?.includes('ngrok')
  ? { 'ngrok-skip-browser-warning': 'true' }
  : {};
const authApi = {
  create: (data) => {
    const url = `${api_prefix_v1}/auth/register/`;
    return axios.post(url, data, { headers: ngrokHeaders });
  },
  login: (data) => {
    const url = `${api_prefix_v1}/auth/login/`;
    return axios.post(url, data, { headers: ngrokHeaders });
  },
  googleLogin: (accessToken) => {
    const url = `${api_prefix_v1}/auth/google/`;
    return axios.post(url, { access_token: accessToken }, { headers: ngrokHeaders });
  },
  facebookLogin: (accessToken) => {
    const url = `${api_prefix_v1}/auth/facebook/`;
    return axios.post(url, { access_token: accessToken }, { headers: ngrokHeaders });
  },
  logout: (userId) => {
    const url = `/auth/logout/${userId}`;
    return axiosClient.post(url);
  },

  forgotPassword: (email) => {
    const url = "auth/forgot-password";
    return axiosClient.post(url, { email });
  },

  resetPassword: (token, data) => {
    const url = `auth/reset-password/${token}`;
    return axiosClient.post(url, data);
  },
};

export default authApi;
