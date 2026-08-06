export const PRICE_RANGES = [
  { labelKey: "price_under_500k", min: 0, max: 500000 },
  { labelKey: "price_500k_1m", min: 500000, max: 1000000 },
  { labelKey: "price_1m_1m5", min: 1000000, max: 1500000 },
  { labelKey: "price_1m5_2m", min: 1500000, max: 2000000 },
  { labelKey: "price_2m_2m5", min: 2000000, max: 2500000 },
  { labelKey: "price_2m5_3m", min: 2500000, max: 3000000 },
  { labelKey: "price_above_3m", min: 3000000, max: 99999999 },
];

export const SHOE_SIZES = Array.from({ length: 7 }, (_, i) => String(35 + i));
export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export const SORT_OPTIONS = [
  { slug: "newest", labelKey: "sort_newest" },
  { slug: "best-selling", labelKey: "sort_best_selling" },
  { slug: "price-asc", labelKey: "sort_price_low_high" },
  { slug: "price-desc", labelKey: "sort_price_high_low" },
  { slug: "rating", labelKey: "sort_top_rated" },
];
