import axiosClient from "../axiosClient";

const userApi = {
    update: (userId, data) => {
        const url = `/management/user/${userId}`;
        return axiosClient.put(url, data);
    },
    updatePermission: (userId, data) => {
        console.log(userId)
        console.log(data)
        const url = `/management/user/permissions/${userId}`;
        return axiosClient.put(url, data);
    },
    delete: (id) => {
        const url = `/management/user/${id}`;
        return axiosClient.delete(url);
    }
};

export default userApi;