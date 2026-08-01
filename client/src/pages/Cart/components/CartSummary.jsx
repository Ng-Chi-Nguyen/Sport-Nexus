import useCoupon from "@/hooks/useCoupon";
import { formatCurrency } from "@/utils/formatters";

const CartSummary = ({ selectedItems, onCheckout }) => {
  const {
    couponCode,
    setCouponCode,
    couponMsg,
    couponData,
    loading: couponLoading,
    applyCoupon,
    clearCoupon,
  } = useCoupon();

  const subtotal = selectedItems.reduce((s, i) => {
    const price = i.variant?.price || i.product?.base_price || 0;
    return s + Number(price) * i.quantity;
  }, 0);
  const discount = couponData?.discount ?? 0;
  const finalAmount = couponData?.newAmount ?? subtotal;
  const shipping = subtotal >= 500000 ? 0 : 30000;

  return (
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200 text-slate-800 dark:text-slate-100">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        Tổng cộng
      </h3>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Mã giảm giá"
          className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => applyCoupon(subtotal, couponCode)}
          disabled={couponLoading || !couponCode}
          className="px-4 py-2.5 bg-sky-600 dark:bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shrink-0"
        >
          {couponLoading ? "Đang xử lý..." : "Áp dụng"}
        </button>
      </div>

      {couponMsg && (
        <p
          className={`text-xs ${couponMsg.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
        >
          {couponMsg.text}
        </p>
      )}

      {couponData && (
        <button
          type="button"
          onClick={clearCoupon}
          className="text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
        >
          Xóa mã
        </button>
      )}

      <div className="space-y-2.5 text-sm border-t border-slate-200 dark:border-slate-800 pt-3">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tạm tính</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Giảm giá</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Phí vận chuyển</span>
          <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-base border-t border-slate-200 dark:border-slate-800 pt-2.5">
          <span>Tổng cộng</span>
          <span className="text-rose-600 dark:text-rose-400">
            {formatCurrency(finalAmount + shipping)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCheckout(selectedItems)}
        disabled={selectedItems.length === 0}
        className="w-full py-3 bg-amber-500 dark:bg-amber-600 text-white rounded-xl hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
      >
        Tiến hành thanh toán ({selectedItems.length} sản phẩm)
      </button>
    </div>
  );
};

export default CartSummary;
