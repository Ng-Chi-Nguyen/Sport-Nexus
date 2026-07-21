import axiosClient from "@/lib/axiosClient";

export const productDetailLoader = async ({ params }) => {
  try {
    const { slug } = params;
    const res = await axiosClient.get(`/home/product/slug/${slug}`);
    return res;
  } catch {
    return { success: false, data: null };
  }
};
