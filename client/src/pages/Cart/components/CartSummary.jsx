import useCoupon from "@/hooks/useCoupon";
import useCouponSuggestions from "@/hooks/useCouponSuggestions";
import CouponInput from "@/pages/ProductDetail/components/CouponInput";
import { formatCurrency } from "@/utils/formatters";
import { getMemberPrice } from "@/utils/tierPrice";
import useMemberDiscount from "@/hooks/useMemberDiscount";
import { useTranslation } from "react-i18next";

const CartSummary = ({ selectedItems, onCheckout }) => {
  const { t } = useTranslation();
  const { suggestions } = useCouponSuggestions();
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
  const memberPercent = useMemberDiscount();
  const memberSubtotal = selectedItems.reduce((s, i) => {
    const price = i.variant?.price || i.product?.base_price || 0;
    return s + getMemberPrice(price, memberPercent) * i.quantity;
  }, 0);
  const memberDiscount = subtotal - memberSubtotal;
  const discount = couponData?.discount ?? 0;
  const finalAmount = couponData?.newAmount ?? subtotal;
  const shipping = subtotal >= 500000 ? 0 : 30000;

  return (
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200 text-slate-800 dark:text-slate-100">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        {t("order_summary_heading")}
      </h3>

      <CouponInput
        couponCode={couponCode}
        onCodeChange={setCouponCode}
        onApply={(code) => applyCoupon(subtotal, code || couponCode)}
        onClear={clearCoupon}
        message={couponMsg}
        loading={couponLoading}
        discount={couponData?.discount ?? null}
        oldAmount={couponData?.oldAmount ?? null}
        newAmount={couponData?.newAmount ?? null}
        suggestions={suggestions}
      />

      <div className="space-y-2.5 text-sm border-t border-slate-200 dark:border-slate-800 pt-3">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t("subtotal")}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>{t("discount_label")}</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        {memberDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>
              {t("loyalty.member_discount_label", {
                percent: memberPercent,
              })}
            </span>
            <span>-{formatCurrency(memberDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t("shipping_fee", "Phí vận chuyển")}</span>
          <span>
            {shipping === 0 ? t("free_shipping") : formatCurrency(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-base border-t border-slate-200 dark:border-slate-800 pt-2.5">
          <span>{t("total")}</span>
          <span className="text-rose-600 dark:text-rose-400">
            {formatCurrency(finalAmount - memberDiscount + shipping)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCheckout(selectedItems, couponCode)}
        disabled={selectedItems.length === 0}
        className="w-full py-3 bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
      >
        {t("checkout_btn", { count: selectedItems.length })}
      </button>
    </div>
  );
};

export default CartSummary;
