import axiosClient from "@/lib/axiosClient";

const permissionApi = {
  create: (data) => {
    const url = "/management/permission";
    return axiosClient.post(url, data);
  },
  update: (slug, data) => {
    console.log(data);
    console.log(slug);
    const url = `/management/permission/slug/${slug}`;
    return axiosClient.put(url, data);
  },
  delete: (slug) => {
    const url = `/management/permission/slug/${slug}`;
    return axiosClient.delete(url);
  },
};

export default permissionApi;
