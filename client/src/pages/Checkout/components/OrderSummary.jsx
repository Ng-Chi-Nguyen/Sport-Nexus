import { ShoppingBag, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CouponInput from "@/pages/ProductDetail/components/CouponInput";
import { formatCurrency } from "@/utils/formatters";
import OrderItem from "./OrderItem";

const OrderSummary = ({
  items,
  totalAmount,
  discount,
  finalAmount,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onClearCoupon,
  couponMsg,
  couponLoading,
  couponData,
  submitting,
  fullAddress,
  email,
  onPlaceOrder,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        <ShoppingBag size={16} />
        Đơn hàng ({items.length} sản phẩm)
      </h2>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item, index) => (
          <OrderItem key={index} item={item} />
        ))}
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      <CouponInput
        couponCode={couponCode}
        onCodeChange={onCouponCodeChange}
        onApply={onApplyCoupon}
        onClear={onClearCoupon}
        message={couponMsg}
        loading={couponLoading}
        discount={couponData?.discount ?? null}
        oldAmount={couponData?.oldAmount ?? null}
        newAmount={couponData?.newAmount ?? null}
      />

      <hr className="border-slate-200 dark:border-slate-800" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tạm tính</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Giảm giá</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <hr className="border-slate-200 dark:border-slate-800 my-1" />
        <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100">
          <span>Tổng cộng</span>
          <span className="text-rose-600 dark:text-rose-400">
            {formatCurrency(finalAmount)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={submitting || !fullAddress || !email.trim()}
        className="w-full py-3 bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
      >
        {submitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center justify-center gap-1 w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer pt-1"
      >
        <ChevronLeft size={14} />
        Quay lại
      </button>
    </div>
  );
};

export default OrderSummary;
