import axios from 'axios';

// 1. Khởi tạo instance
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// 2. Interceptor cho Request: Tự động gắn Token vào header mỗi khi gửi API
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); // Kiểm tra kỹ tên key này
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// 3. Interceptor cho Response: Xử lý dữ liệu trả về và Tự động Refresh Token khi hết hạn
axiosClient.interceptors.response.use(
    (response) => {
        // Trả về data trực tiếp để FE dùng cho gọn
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 403) {
            // Lấy tin nhắn từ server ("Bạn không có quyền này!")
            const message = error.response.data?.message || "Bạn không có quyền thực hiện hành động này";

            // Bạn có thể dùng toast.error(message) nếu có thư viện Toast, 
            // hoặc trả về một object lỗi có chứa message để UI hiển thị.
            console.error("Lỗi phân quyền:", message);

            // Quan trọng: Gán lại message vào error để các component (như toast) lấy được đúng câu này
            error.message = message;
            return Promise.reject(error);
        }

        // Kiểm tra nếu server trả về lỗi 401 và mã lỗi là TOKEN_EXPIRED
        if (error.response && error.response.status === 401 && error.response.data.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Lấy Refresh Token từ LocalStorage
                const refreshToken = localStorage.getItem("refreshToken");

                // Gọi API refresh (Sử dụng 'axios' gốc để tránh bị lặp vô tận)
                // Lưu ý: Đường dẫn này phải khớp với Backend của bạn
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, { refreshToken });

                if (res.data && res.data.accessToken) {
                    const newAccessToken = res.data.accessToken;

                    // Lưu Access Token mới
                    localStorage.setItem("accessToken", newAccessToken);

                    // Gắn token mới vào header và thực hiện lại request cũ
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                console.error(">>> LỖI KHI ĐANG REFRESH:", refreshError.response);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;