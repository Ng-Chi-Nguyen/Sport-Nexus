import axiosClient from "@/lib/axiosClient";

const collectionApi = {
  create: (data) => {
    const url = "/management/collection";
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (collectionId, data) => {
    const url = `/management/collection/${collectionId}`;
    return axiosClient.put(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (collectionId) => {
    const url = `/management/collection/${collectionId}`;
    return axiosClient.delete(url);
  },
};

export default collectionApi;
