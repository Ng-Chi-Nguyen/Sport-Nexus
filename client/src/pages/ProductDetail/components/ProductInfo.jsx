import { Star, ShieldCheck, Tag } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const ProductInfo = ({
  product,
  avgRating: propAvgRating,
  totalReviews: propTotalReviews,
  currentPrice: propCurrentPrice,
  quantity,
}) => {
  if (!product) return null;

  // 1. Tự động tính trung bình cộng rating & tổng lượt review từ mảng Reviews
  const reviews = product.Reviews || [];
  const totalReviews = propTotalReviews ?? reviews.length;

  const calculatedAvgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        totalReviews
      : 0;
  const avgRating = propAvgRating ?? calculatedAvgRating;

  // 2. Tính toán giá bán & phần trăm giảm giá (%)
  const basePrice = Number(product.base_price || 0);
  const currentPrice =
    propCurrentPrice ??
    (product.ProductVariants?.[0]?.price
      ? Number(product.ProductVariants[0].price)
      : basePrice);

  const hasDiscount = basePrice > 0 && currentPrice < basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;

  return (
    <div className="space-y-4 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Thương hiệu & Danh mục & Mã SP */}
      <div className="flex gap-2 text-xs flex-wrap items-center">
        <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2.5 py-1">
          #SP{product.id}
        </span>

        {product.category && (
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1">
            <Tag size={12} />
            {product.category.name}
          </span>
        )}
        {product.brand && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
            {product.brand.logo && (
              <img
                src={product.brand.logo}
                alt={product.brand.name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {product.brand.name}
            </span>
          </div>
        )}
      </div>

      {/* Tên sản phẩm */}
      <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
        {product.name}
      </h1>

      {/* Đánh giá Sao & Lượt nhận xét */}
      {totalReviews > 0 && (
        <a
          href="#reviews"
          className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 text-amber-500">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              {Number(avgRating).toFixed(1)}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 underline underline-offset-2">
            ({totalReviews} đánh giá từ khách hàng)
          </span>
        </a>
      )}

      {/* Khối Giá bán & Badge phần trăm giảm giá */}
      <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-900 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <div className="flex items-baseline gap-3 flex-wrap">
          <p className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(currentPrice)}
          </p>

          {hasDiscount && (
            <>
              <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 line-through font-medium">
                {formatCurrency(basePrice)}
              </p>
              <span className="ml-auto bg-rose-600 dark:bg-rose-500 text-white text-xs font-black px-2.5 py-1 shadow-sm">
                TẶNG -{discountPercent}%
              </span>
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Tạm tính:{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatCurrency(currentPrice * quantity)}
          </span>
        </p>
      </div>

      {/* Cam kết ngắn */}
      <div className="flex items-center gap-2 pt-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
        <ShieldCheck size={16} />
        <span>Sản phẩm chính hãng 100% — Cam kết bảo hành chính hãng</span>
      </div>
    </div>
  );
};

export default ProductInfo;
