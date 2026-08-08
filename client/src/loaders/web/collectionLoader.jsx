import axiosClient from "@/lib/axiosClient";

export const collectionsLoader = async () => {
  try {
    const res = await axiosClient.get("/home/collection");
    return res.data || { collections: [] };
  } catch {
    return { collections: [] };
  }
};

export const collectionDetailLoader = async ({ params }) => {
  try {
    const res = await axiosClient.get(`/home/collection/slug/${params.slug}`);
    return res.data || null;
  } catch {
    return null;
  }
};
