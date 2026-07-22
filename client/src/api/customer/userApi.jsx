import axiosClient from "@/lib/axiosClient";

const userApi = {
  getProfile: () => {
    const url = "user/profile";
    return axiosClient.get(url);
  },

  updateProfile: (data) => {
    const url = "user/profile";
    return axiosClient.put(url, data);
  },

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const url = "user/upload-avatar";
    return axiosClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default userApi;
