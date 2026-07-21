import { Minus, Plus, Heart, Share2, ShoppingCart } from "lucide-react";

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
  const outOfStock = currentStock !== null && currentStock <= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center border border-slate-300 rounded-sm overflow-hidden">
          <button
            onClick={() => onQtyChange(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={quantity}
            min={1}
            max={maxStock}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              const clamped = Math.max(1, Math.min(maxStock, Number(v || 1)));
              onQtyChange(clamped);
            }}
            onBlur={() => {
              if (quantity === "" || quantity < 1) onQtyChange(1);
              else if (quantity > maxStock) onQtyChange(maxStock);
            }}
            className="w-14 text-center text-sm font-semibold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => onQtyChange(Math.min(maxStock, quantity + 1))}
            className="p-2 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
            disabled={quantity >= maxStock}
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={onWishlist}
          className={`p-2.5 border rounded-sm transition-all ${
            wishlisted
              ? "border-red-300 text-red-500 bg-red-50"
              : "border-slate-300 text-slate-500 hover:text-red-500 hover:border-red-300"
          }`}
        >
          <Heart size={18} className={wishlisted ? "fill-red-500" : ""} />
        </button>

        <button
          onClick={onShare}
          className="p-2.5 border border-slate-300 rounded-sm text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all"
          title="Chia sẻ"
        >
          <Share2 size={18} />
        </button>
      </div>

      {currentStock !== null && (
        <p className="text-sm">
          {currentStock > 0 ? (
            <span className="text-green-600">Còn {currentStock} sản phẩm</span>
          ) : (
            <span className="text-red-500">Hết hàng</span>
          )}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          disabled={outOfStock}
          onClick={onBuyNow}
          className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-sm hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mua ngay
        </button>
        <button
          disabled={outOfStock}
          onClick={onAddToCart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={18} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
