import axiosClient from "@/lib/axiosClient";

export const homeLoader = async () => {
  const res = await axiosClient.get("/home");
  return res.data;
};
