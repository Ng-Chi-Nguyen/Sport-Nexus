import { Star, ShieldCheck, Tag } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const ProductInfo = ({
  product,
  avgRating: propAvgRating,
  totalReviews: propTotalReviews,
  currentPrice: propCurrentPrice,
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
    <div className="space-y-4 font-sans select-none">
      {/* Thương hiệu & Danh mục & Mã SP */}
      <div className="flex gap-2 text-xs">
        <span className="font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
          #SP{product.id}
        </span>

        {product.category && (
          <span className="flex items-center gap-1 font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <Tag size={12} />
            {product.category.name}
          </span>
        )}
        {product.brand && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            {product.brand.logo && (
              <img
                src={product.brand.logo}
                alt={product.brand.name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-bold text-slate-700">
              {product.brand.name}
            </span>
          </div>
        )}
      </div>

      {/* Tên sản phẩm */}
      <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-snug tracking-tight">
        {product.name}
      </h1>

      {/* Đánh giá Sao & Lượt nhận xét */}
      {totalReviews > 0 && (
        <a
          href="#reviews"
          className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded text-amber-500">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-slate-800">
              {Number(avgRating).toFixed(1)}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 underline underline-offset-2">
            ({totalReviews} đánh giá từ khách hàng)
          </span>
        </a>
      )}

      {/* Khối Giá bán & Badge phần trăm giảm giá */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-baseline gap-3">
        <p className="text-2xl md:text-3xl font-black text-red-600 tracking-tight">
          {formatCurrency(currentPrice)}
        </p>

        {hasDiscount && (
          <>
            <p className="text-sm md:text-base text-slate-400 line-through font-medium">
              {formatCurrency(basePrice)}
            </p>
            <span className="ml-auto bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-sm">
              TẶNG -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Thuộc tính sản phẩm */}
      {product.ProductAttributeKeys?.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Thông tin thuộc tính
          </p>
          <div className="flex flex-wrap gap-2">
            {product.ProductAttributeKeys.map((pak) => (
              <span
                key={pak.attributeKey?.id || pak.id}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
              >
                <span>{pak.attributeKey?.name}</span>
                {pak.attributeKey?.unit && (
                  <span className="text-slate-400 font-normal">
                    ({pak.attributeKey.unit})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cam kết ngắn */}
      <div className="flex items-center gap-2 pt-2 text-[12px] font-medium text-emerald-600">
        <ShieldCheck size={16} />
        <span>Sản phẩm chính hãng 100% — Cam kết bảo hành chính hãng</span>
      </div>
    </div>
  );
};

export default ProductInfo;
