import axiosClient from "./axiosClient";

const permissionApi = {
    create: (data) => {
        const url = '/management/permission';
        return axiosClient.post(url, data);
    },
    update: (slug, data) => {
        const url = `/management/permission/slug/${slug}`;
        return axiosClient.put(url, data);
    },
};

export default permissionApi;