import axiosClient from "@/lib/axiosClient";

const chatApi = {
  send: (message) => {
    return axiosClient.post("/chat", { message });
  },
};

export default chatApi;
