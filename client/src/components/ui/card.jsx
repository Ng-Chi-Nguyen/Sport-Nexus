import { Earth, ShoppingCart, Eye, Heart, Star } from "lucide-react";
import Badge from "./badge";
import { formatCurrency } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

const GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-yellow-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-indigo-500",
  "from-lime-500 to-green-500",
];

const CardBrand = ({ data }) => {
  const { logo, name, origin } = data || {};

  const placeholderImage =
    "https://placehold.co/200x200/0d121f/94a3b8?text=No+Logo";

  return (
    <div
      className="group relative bg-[#111827]/40 p-5 cursor-pointer w-[90%]
                 border border-slate-800/60
                 hover:border-sky-500/40
                 transition-all duration-400
                 hover:shadow-[0_0_40px_rgba(14,165,233,0.12)]
                 overflow-hidden"
    >
      <div
        className="absolute inset-0  opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 pointer-events-none
                   bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent"
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div
          className="w-[70%] h-auto p-2 flex items-center justify-center
                     bg-[#0D121F] overflow-hidden flex-shrink-0
                     ring-2 ring-slate-700/60 group-hover:ring-sky-400/50
                     shadow-[0_0_20px_rgba(0,0,0,0.3)]
                     group-hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]
                     transition-all duration-300"
        >
          <img
            src={logo || placeholderImage}
            alt={name || "Brand Logo"}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
        </div>

        <div className="space-y-1">
          <h3
            className="text-base font-bold text-slate-100 truncate max-w-[180px] mx-auto group-hover:text-white transition-colors duration-200 tracking-wide"
            title={name}
          >
            {name || "Tên thương hiệu"}
          </h3>

          {origin ? (
            <Badge color="blue">
              <Earth size={12} className="shrink-0" strokeWidth={2} />
              <span className="pl-1 truncate max-w-[140px]">{origin}</span>
            </Badge>
          ) : (
            <span className="text-[12px] text-slate-600 italic block">
              Chưa cập nhật
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const salePrice = product.min_price || product.base_price || 0;
  const originalPrice = product.base_price || 0;
  const hasDiscount = originalPrice > salePrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  const goToDetail = (e) => {
    e.stopPropagation();
    navigate(`/san-pham/${product.slug}`);
  };

  return (
    <div className="group flex flex-col bg-white rounded-sm transition-all duration-300 border">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-slate-100">
        {product.thumbnail ? (
          <div className="w-full h-full bg-[#F8F8F8] p-2">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} flex items-center justify-center`}
          >
            <span className="text-white/30 font-black text-6xl select-none">
              {product.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm z-10">
            -{discountPercent}%
          </div>
        )}

        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <div className="flex bg-white rounded-sm shadow-md border border-slate-200 divide-x divide-slate-100 overflow-hidden">
            <button
              title="Thêm vào giỏ"
              className="p-2.5 hover:bg-slate-50 text-slate-800 transition-colors"
            >
              <ShoppingCart size={16} />
            </button>
            <button
              title="Xem chi tiết"
              className="p-2.5 hover:bg-slate-50 text-slate-800 transition-colors"
              onClick={goToDetail}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3 flex flex-col flex-grow space-y-1.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase truncate max-w-[80%]">
            {product.brand?.name || "Chưa phân loại"}
          </span>
          <button className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
            <Heart size={16} />
          </button>
        </div>

        <h3
          className="text-[13px] md:text-[14px] font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-blue-600 cursor-pointer transition-colors min-h-[38px]"
          onClick={() => navigate(`/san-pham/${product.slug}`)}
        >
          {product.name}
        </h3>

        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
            <Star size={12} className="fill-amber-400" />
            <span>{Number(product.avg_rating).toFixed(1)}</span>
            <span className="text-slate-400 font-normal">
              ({product.total_reviews})
            </span>
          </div>
        )}

        <div className="pt-1 mt-auto flex items-center gap-2 flex-wrap">
          <p className="text-[15px] md:text-[16px] font-bold text-red-600">
            {formatCurrency(salePrice)}
          </p>
          {hasDiscount && (
            <p className="text-[12px] md:text-[13px] text-slate-400 line-through">
              {formatCurrency(originalPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { CardBrand, ProductCard };
