import { useState } from "react";
import { Bookmark, Check, Copy, Shirt, Tag } from "lucide-react";
import { useCoupons } from "@/contexts/CouponContext";
import { formatDate, formatCurrency } from "@/utils/formatters";

const CouponCard = ({ coupon }) => {
  const { isSaved, toggleSave } = useCoupons();
  const [copiedCode, setCopiedCode] = useState(null);
  const [now] = useState(() => Date.now());

  const isInactive = coupon.is_active === false;
  const isExpired = new Date(coupon.end_date).getTime() < now;
  const isOutOfStock = coupon.usage_count >= coupon.usage_limit;
  const disabled = isInactive || isExpired || isOutOfStock;

  const statusLabel = isInactive
    ? "Ngưng hiệu lực"
    : isExpired
      ? "Hết hạn"
      : isOutOfStock
        ? "Hết lượt"
        : null;

  const saved = isSaved(coupon.code);

  const handleCopy = () => {
    if (disabled) return;
    if (!saved) toggleSave(coupon);
    navigator.clipboard?.writeText(coupon.code);
    setCopiedCode(coupon.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-lg text-white ${
        disabled ? "opacity-60 grayscale pointer-events-none select-none" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
        <Shirt className="absolute -top-6 -left-4 w-20 h-20 rotate-12" />
        <Tag className="absolute -bottom-6 -right-3 w-24 h-24 -rotate-12" />
      </div>

      {statusLabel && (
        <span className="absolute top-2 right-2 z-10 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
          {statusLabel}
        </span>
      )}

      <div className="relative flex items-stretch">
        <div className="flex flex-col justify-center gap-0.5 px-4 py-3 min-w-[118px]">
          <div className="text-[9px] font-light uppercase tracking-[0.18em] text-white/80">
            Phiếu giảm giá
          </div>
          <div className="text-xl font-black leading-none drop-shadow-sm">
            {coupon.discount_type === "PERCENTAGE"
              ? `-${coupon.discount_value}%`
              : formatCurrency(coupon.discount_value)}
          </div>
          <div className="text-[9px] font-light uppercase leading-snug text-white/75">
            {coupon.discount_type === "PERCENTAGE"
              ? `Tối đa ${formatCurrency(coupon.max_discount)}`
              : "Trên đơn hàng"}
          </div>
        </div>

        <div className="relative border-l border-dashed border-white/40">
          <span className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-white" />
          <span className="absolute -left-1.5 -bottom-1.5 w-3 h-3 rounded-full bg-white" />
        </div>

        <div className="flex-1 flex flex-col gap-1.5 px-3 py-3">
          <div className="flex items-center gap-1.5">
            <span className="flex-1 rounded-md bg-white/15 px-2 py-1 font-mono font-bold uppercase tracking-wider text-white text-[11px]">
              {coupon.code}
            </span>
            <button
              onClick={handleCopy}
              disabled={disabled}
              className="shrink-0 inline-flex items-center gap-1 rounded-md border border-white/70 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white hover:text-blue-600 transition-colors disabled:cursor-not-allowed"
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="w-3 h-3" />
                  Copy
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] font-light leading-snug text-white/80">
            Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}
          </div>
          <div className="text-[10px] font-light leading-snug text-white/80">
            HSD: {formatDate(coupon.end_date)} · {coupon.usage_count}/{coupon.usage_limit}
          </div>

          <button
            onClick={() => toggleSave(coupon)}
            disabled={disabled}
            className={`mt-auto inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed ${
              saved
                ? "border-white bg-white text-blue-600"
                : "border-white/50 text-white/80 hover:bg-white/10"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
            {saved ? "Đã lưu mã" : "Lưu mã"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
