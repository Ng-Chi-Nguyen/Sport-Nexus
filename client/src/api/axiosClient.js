import axios from 'axios';
const axiosClient = axios.create({
    // baseURL: "http://localhost:8080/api/v1", // URL Backend
    baseURL: import.meta.env.VITE_API_URL, // URL Backend 
    headers: { 'Content-Type': 'application/json' }
});
// Interceptor: Gắn token vào mỗi request gửi đi
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ trả về phần data của server, bỏ qua các thông tin rác của axios
        return response.data;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;