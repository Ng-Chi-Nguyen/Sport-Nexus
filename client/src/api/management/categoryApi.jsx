import axiosClient from "@/lib/axiosClient";

const categoryApi = {
  create: (data) => {
    const url = "/management/category";
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (categoryId, data) => {
    // console.log(categoryId);
    const url = `/management/category/${categoryId}`;
    return axiosClient.put(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (categoryId) => {
    // console.log(categoryId);
    const url = `/management/category/${categoryId}`;
    return axiosClient.delete(url);
  },
};

export default categoryApi;
