import { Earth, ShoppingCart, Eye, Heart, Star } from "lucide-react";
import Badge from "./badge";
import { formatCurrency } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });
  const { logo, name, origin } = data || {};

  const placeholderImage =
    "https://placehold.co/200x200/0d121f/94a3b8?text=No+Logo";

  return (
    <div
      className="group relative bg-white dark:bg-[#111827]/40 p-5 cursor-pointer w-[90%]
                 border border-slate-200 dark:border-slate-800/60 rounded-xl
                 hover:border-sky-500/40
                 transition-all duration-400
                 shadow-sm dark:shadow-none
                 hover:shadow-[0_0_40px_rgba(14,165,233,0.12)]
                 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 pointer-events-none
                   bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent"
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div
          className="w-[70%] h-auto p-2 flex items-center justify-center
                     bg-slate-50 dark:bg-[#0D121F] overflow-hidden flex-shrink-0 rounded-lg
                     ring-2 ring-slate-200 dark:ring-slate-700/60 group-hover:ring-sky-400/50
                     shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.3)]
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
            className="text-base font-bold text-slate-800 dark:text-slate-100 truncate max-w-[180px] mx-auto group-hover:text-sky-600 dark:group-hover:text-white transition-colors duration-200 tracking-wide"
            title={name}
          >
            {name || t("brand_name")}
          </h3>

          {origin ? (
            <Badge color="blue">
              <Earth size={12} className="shrink-0" strokeWidth={2} />
              <span className="pl-1 truncate max-w-[140px]">{origin}</span>
            </Badge>
          ) : (
            <span className="text-[12px] text-slate-400 dark:text-slate-600 italic block">
              {t("not_updated")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });
  const { addItem } = useCart();
  const { isLiked, toggleLike } = useWishlist();
  const liked = isLiked(product.id);
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
    <div className="group flex flex-col bg-white dark:bg-[#0D121F] transition-all duration-300 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:shadow-none">
      <div className="relative aspect-square overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
        {product.thumbnail ? (
          <div className="w-full h-full bg-slate-50 dark:bg-[#111827]/60 p-2">
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
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 z-10">
            -{discountPercent}%
          </div>
        )}

        {/* NĂºt tĂ¡c vá»¥ nhanh khi hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <div className="flex bg-white dark:bg-[#161F32] shadow-md border border-slate-200 dark:border-slate-700 divide-x divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
            <button
              title={t("add_to_cart")}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (product.first_variant_id) {
                  addItem(product.first_variant_id, 1, product, null);
                }
              }}
            >
              <ShoppingCart size={16} />
            </button>
            <button
              title={t("view_detail")}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              onClick={goToDetail}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3 flex flex-col flex-grow space-y-1.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase truncate max-w-[80%]">
            {product.brand?.name || t("uncategorized")}
          </span>
          <button
            title={liked ? t("remove_favorite") : t("add_favorite")}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(product.id);
            }}
            className={`transition-colors shrink-0 ${
              liked
                ? "text-red-500"
                : "text-slate-400 dark:text-slate-500 hover:text-red-500"
            }`}
          >
            <Heart size={16} className={liked ? "fill-red-500" : ""} />
          </button>
        </div>

        <h3
          className="text-[13px] md:text-[14px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-sky-400 cursor-pointer transition-colors min-h-[38px]"
          onClick={() => navigate(`/san-pham/${product.slug}`)}
        >
          {product.name}
        </h3>

        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-[11px] font-bold">
            <Star size={12} className="fill-amber-400" />
            <span>{Number(product.avg_rating).toFixed(1)}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">
              ({product.total_reviews})
            </span>
          </div>
        )}

        {Number(product.sold_count) > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <ShoppingCart size={12} className="shrink-0" />
            <span>{t("sold_count")}: {Number(product.sold_count)}</span>
          </div>
        )}

        <div className="pt-1 mt-auto flex items-center gap-2 flex-wrap">
          <p className="text-[15px] md:text-[16px] font-bold text-red-600 dark:text-red-500">
            {formatCurrency(salePrice)}
          </p>
          {hasDiscount && (
            <p className="text-[12px] md:text-[13px] text-slate-400 dark:text-slate-500 line-through">
              {formatCurrency(originalPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { CardBrand, ProductCard };
