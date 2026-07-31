import { useState } from "react";
import { Bookmark, Check, Copy, Tag } from "lucide-react";
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
      className={`relative rounded-2xl border border-dashed border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 flex flex-col gap-3 ${
        disabled ? "opacity-60 grayscale pointer-events-none select-none" : ""
      }`}
    >
      {statusLabel && (
        <span className="absolute top-3 right-3 rounded-full bg-slate-700 text-white text-[11px] font-semibold px-2 py-0.5">
          {statusLabel}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-black text-red-600 leading-tight">
            {coupon.discount_type === "PERCENTAGE"
              ? `-${coupon.discount_value}%`
              : formatCurrency(coupon.discount_value)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {coupon.discount_type === "PERCENTAGE"
              ? `Giảm tối đa ${formatCurrency(coupon.max_discount)}`
              : "Giảm trực tiếp trên đơn hàng"}
          </div>
        </div>
        <Tag className="w-5 h-5 text-red-400" />
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-1 rounded-lg bg-white border border-slate-200 px-3 py-2 font-mono font-bold text-slate-700 tracking-widest uppercase">
          {coupon.code}
        </span>
        <button
          onClick={handleCopy}
          disabled={disabled}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:cursor-not-allowed"
        >
          {copiedCode === coupon.code ? (
            <>
              <Check className="w-4 h-4" />
              Đã copy
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-600">
        <span>Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}</span>
        <span>Hạn sử dụng: {formatDate(coupon.end_date)}</span>
        <span className="text-slate-400">
          Đã dùng: {coupon.usage_count} / {coupon.usage_limit}
        </span>
      </div>

      <button
        onClick={() => toggleSave(coupon)}
        disabled={disabled}
        className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
          saved
            ? "border-red-600 bg-red-600 text-white"
            : "border-red-600 text-red-600 hover:bg-red-50"
        }`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        {saved ? "Đã lưu mã" : "Lưu mã"}
      </button>
    </div>
  );
};

export default CouponCard;
