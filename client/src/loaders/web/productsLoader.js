import axiosClient from "@/lib/axiosClient";

export const productsLoader = async ({ request }) => {
  const url = new URL(request.url);
  const params = new URLSearchParams({
    page: url.searchParams.get("page") || "1",
    search: url.searchParams.get("search") || "",
    sort: url.searchParams.get("sort") || "newest",
    category_id: url.searchParams.get("category_id") || "",
    brand_id: url.searchParams.get("brand_id") || "",
    price_min: url.searchParams.get("price_min") || "",
    price_max: url.searchParams.get("price_max") || "",
    limit: "12",
  });

  const res = await axiosClient.get(`/home/product/products?${params}`);
  return res.data;
};
