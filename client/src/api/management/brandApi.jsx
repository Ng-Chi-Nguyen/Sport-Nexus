import axiosClient from "@/api/axiosClient";

const brandApi = {
  create: (data) => {
    const url = "/management/brand";
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (brandId, data) => {
    const url = `/management/brand/${brandId}`;
    return axiosClient.put(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (brandId) => {
    const url = `/management/brand/${brandId}`;
    return axiosClient.delete(url);
  },
};

export default brandApi;
