import axiosClient from "./axiosClient";

const permissionApi = {
    create: (data) => {
        const url = '/management/permission';
        return axiosClient.post(url, data);
    },

};

export default permissionApi;