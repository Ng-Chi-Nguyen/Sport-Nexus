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
};

export default brandApi;
