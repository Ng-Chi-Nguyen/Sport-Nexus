import axiosClient from "@/lib/axiosClient";

const supplierdApi = {
  create: (data) => {
    const url = "/management/supplier";
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (supplierId, data) => {
    // console.log(supplierId);
    // console.log(data);
    const url = `/management/supplier/${supplierId}`;
    return axiosClient.put(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (supplierId) => {
    const url = `/management/supplier/${supplierId}`;
    return axiosClient.delete(url);
  },
};

export default supplierdApi;
