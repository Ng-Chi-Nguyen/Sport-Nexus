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
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-5 shadow-xl text-white flex flex-col gap-3 ${
        disabled ? "opacity-60 grayscale pointer-events-none select-none" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
        <Shirt className="absolute -top-4 -right-6 w-28 h-28 rotate-12" />
        <Shirt className="absolute top-1/2 left-1/4 w-24 h-24 -rotate-45 opacity-70" />
        <Tag className="absolute -bottom-8 -left-6 w-32 h-32 -rotate-12" />
      </div>

      {statusLabel && (
        <span className="absolute top-4 right-4 z-10 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
          {statusLabel}
        </span>
      )}

      <div className="relative flex flex-col gap-3 flex-1">
        <div className="text-[11px] font-light uppercase tracking-[0.2em] text-white/80">
          Phiếu giảm giá SportNexus
        </div>

        <div>
          <div className="text-4xl font-black leading-none drop-shadow-sm">
            {coupon.discount_type === "PERCENTAGE"
              ? `-${coupon.discount_value}%`
              : formatCurrency(coupon.discount_value)}
          </div>
          <div className="mt-1 text-[11px] font-light uppercase tracking-wider text-white/80">
            {coupon.discount_type === "PERCENTAGE"
              ? `Giảm tối đa ${formatCurrency(coupon.max_discount)}`
              : "Giảm trực tiếp trên đơn hàng"}
          </div>
        </div>

        <div className="relative flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5 backdrop-blur-sm">
          <span className="flex-1 px-2 py-1 font-mono font-bold uppercase tracking-widest text-white">
            {coupon.code}
          </span>
          <button
            onClick={handleCopy}
            disabled={disabled}
            className="shrink-0 inline-flex items-center gap-1 rounded-md border border-white/70 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-red-600 transition-colors disabled:cursor-not-allowed"
          >
            {copiedCode === coupon.code ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Đã copy
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1 text-[11px] font-light text-white/80">
          <span>Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}</span>
          <span>Hạn sử dụng: {formatDate(coupon.end_date)}</span>
          <span>
            Đã dùng: {coupon.usage_count} / {coupon.usage_limit}
          </span>
        </div>

        <button
          onClick={() => toggleSave(coupon)}
          disabled={disabled}
          className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
            saved
              ? "border-white bg-white text-red-600"
              : "border-white/50 text-white/80 hover:bg-white/10"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          {saved ? "Đã lưu mã" : "Lưu mã"}
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
