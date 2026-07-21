import axiosClient from "@/lib/axiosClient";

export const productDetailLoader = async ({ params }) => {
  const { slug } = params;
  const res = await axiosClient.get(`/home/product/slug/${slug}`);
  return res;
};
