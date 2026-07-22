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
    <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
        <ShoppingBag size={16} />
        Đơn hàng ({items.length} sản phẩm)
      </h2>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <OrderItem key={index} item={item} />
        ))}
      </div>

      <hr className="border-slate-200" />

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

      <hr className="border-slate-200" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Tạm tính</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <hr className="border-slate-200" />
        <div className="flex justify-between text-base font-bold text-slate-800">
          <span>Tổng cộng</span>
          <span className="text-red-600">{formatCurrency(finalAmount)}</span>
        </div>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={submitting || !fullAddress || !email.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center gap-1 w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ChevronLeft size={14} />
        Quay lại
      </button>
    </div>
  );
};

export default OrderSummary;
