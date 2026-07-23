import axiosClient from "@/lib/axiosClient";

export const productsLoader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams();
    params.set("page", url.searchParams.get("page") || "1");
    params.set("search", url.searchParams.get("search") || "");
    params.set("sort", url.searchParams.get("sort") || "newest");
    params.set("limit", "12");
    if (url.searchParams.get("category_ids")) params.set("category_ids", url.searchParams.get("category_ids"));
    else if (url.searchParams.get("category_id")) params.set("category_id", url.searchParams.get("category_id"));
    if (url.searchParams.get("brand_ids")) params.set("brand_ids", url.searchParams.get("brand_ids"));
    else if (url.searchParams.get("brand_id")) params.set("brand_id", url.searchParams.get("brand_id"));
    if (url.searchParams.get("price_min")) params.set("price_min", url.searchParams.get("price_min"));
    if (url.searchParams.get("price_max")) params.set("price_max", url.searchParams.get("price_max"));
    if (url.searchParams.get("attr_filter")) params.set("attr_filter", url.searchParams.get("attr_filter"));

    const res = await axiosClient.get(`/home/product/products?${params}`);
    return res.data;
  } catch {
    return {
      products: [],
      pagination: { totalPages: 1, currentPage: 1 },
      categories: [],
      brands: [],
    };
  }
};
