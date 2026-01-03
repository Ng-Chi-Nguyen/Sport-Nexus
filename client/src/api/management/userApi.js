import axiosClient from "../axiosClient";

const userApi = {
    update: (userId, data) => {
        const url = `/management/user/${userId}`;
        return axiosClient.put(url, data);
    },
    delete: (id) => {
        const url = `/management/user/${id}`;
        return axiosClient.delete(url);
    }
};

export default userApi;