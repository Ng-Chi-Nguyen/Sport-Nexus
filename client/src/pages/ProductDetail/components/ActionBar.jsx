import { Minus, Plus, Heart, Share2, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

const ActionBar = ({
  quantity,
  maxStock,
  onQtyChange,
  wishlisted,
  onWishlist,
  onShare,
  currentStock,
  onAddToCart,
  onBuyNow,
}) => {
  // Sửa lại: Bỏ keyPrefix đi
  const { t } = useTranslation();
  const outOfStock = currentStock !== null && currentStock <= 0;

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Cụm chọn số lượng: Khóa và làm mờ hoàn toàn khi hết hàng */}
        <div
          className={`flex items-center border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#111827]/40 ${outOfStock ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, quantity - 1))}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
            disabled={quantity <= 1 || outOfStock}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={quantity}
            min={1}
            max={maxStock}
            disabled={outOfStock}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              const clamped = Math.max(1, Math.min(maxStock, Number(v || 1)));
              onQtyChange(clamped);
            }}
            onBlur={() => {
              if (quantity === "" || quantity < 1) onQtyChange(1);
              else if (quantity > maxStock) onQtyChange(maxStock);
            }}
            className="w-14 py-[11px] text-center text-sm font-semibold text-slate-800 dark:text-slate-200 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => onQtyChange(Math.min(maxStock, quantity + 1))}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
            disabled={quantity >= maxStock || outOfStock}
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onWishlist}
          className={`p-3 border transition-all cursor-pointer shadow-sm ${
            wishlisted
              ? "border-rose-300 dark:border-rose-500/40 text-rose-500 bg-rose-50 dark:bg-rose-500/10"
              : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/40 bg-slate-50 dark:bg-[#111827]/40"
          }`}
          title={t("wishlist")}
        >
          <Heart size={18} className={wishlisted ? "fill-rose-500" : ""} />
        </button>

        <button
          type="button"
          onClick={onShare}
          className="p-3 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-600 hover:border-sky-300 dark:hover:border-sky-500/40 bg-slate-50 dark:bg-[#111827]/40 transition-all cursor-pointer shadow-sm"
          title={t("share")}
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Hiển thị thông báo tồn kho */}
      {currentStock !== null && (
        <p className="text-sm">
          {currentStock > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {t("in_stock", { count: currentStock })}
            </span>
          ) : (
            <span className="text-rose-500 dark:text-rose-400 font-medium">
              {t("out_of_stock")}
            </span>
          )}
        </p>
      )}

      {/* Nút Mua ngay và Thêm vào giỏ */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={outOfStock}
          onClick={onBuyNow}
          className="flex-1 px-6 py-3 bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          {t("buy_now")}
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={onAddToCart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          <ShoppingCart size={18} />
          {t("add_to_cart")}
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
