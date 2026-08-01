import axiosClient from "@/lib/axiosClient";

const supportApi = {
  sendEmail: (data) => {
    return axiosClient.post("email/support", data);
  },
};

export default supportApi;
