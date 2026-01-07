import axiosClient from "@/lib/axiosClient";

const userApi = {
  create: (data) => {
    const url = "/management/user";
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (userId, data) => {
    return axiosClient.put(`/management/user/${userId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updatePermission: (userId, data) => {
    console.log(userId);
    console.log(data);
    const url = `/management/user/permissions/${userId}`;
    return axiosClient.put(url, data);
  },
  delete: (id) => {
    const url = `/management/user/${id}`;
    return axiosClient.delete(url);
  },
};

export default userApi;
