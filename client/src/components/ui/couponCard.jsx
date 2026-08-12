import { useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  Lock,
  Printer,
  Shirt,
  Tag,
  Trash2,
} from "lucide-react";
import { useCoupons } from "@/contexts/CouponContext";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { SportNexusLogoIcon } from "@/components/logo";
import { useTranslation } from "react-i18next";
import { printElement } from "@/utils/printUtils";

const CouponCard = ({ coupon, showPrint = true, locked = false }) => {
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });
  const { isSaved, toggleSave } = useCoupons();
  const [copiedCode, setCopiedCode] = useState(null);
  const [now] = useState(() => Date.now());

  const isInactive = coupon.is_active === false;
  const isExpired = new Date(coupon.end_date).getTime() < now;
  const isOutOfStock = coupon.usage_count >= coupon.usage_limit;
  const isGiftUsedUp = coupon.is_gift === true && (coupon.quantity ?? 1) <= 0;
  const disabled =
    isInactive || isExpired || isOutOfStock || isGiftUsedUp;

  const statusLabel = isInactive
    ? t("coupon_inactive")
    : isExpired
      ? t("coupon_expired")
      : isOutOfStock
        ? t("coupon_out_of_stock")
        : isGiftUsedUp
          ? t("coupon_out_of_stock")
          : null;

  const saved = isSaved(coupon.code);

  const handleCopy = () => {
    if (disabled) return;
    if (!saved) toggleSave(coupon);
    navigator.clipboard?.writeText(coupon.code);
    setCopiedCode(coupon.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrint = () => {
    if (disabled || !showPrint) return;

    const couponElement = document.getElementById(`coupon-card-${coupon.code}`);
    if (!couponElement) return;

    printElement(couponElement, {
      title: `In Phiếu Giảm Giá - ${coupon.code}`,
      pageSize: "105mm 45mm",
      containerWidth: "100mm",
      containerHeight: "40mm",
    });
  };

  return (
    <div
      id={`coupon-card-${coupon.code}`}
      style={{
        maskImage: `
          radial-gradient(circle at 125px 0, transparent 6px, black 6.5px),
          radial-gradient(circle at 125px 100%, transparent 6px, black 6.5px),
          radial-gradient(circle at 0 50%, transparent 3.5px, black 4px),
          radial-gradient(circle at 100% 50%, transparent 3.5px, black 4px)
        `,
        maskSize: "100% 100%, 100% 100%, 100% 12px, 100% 12px",
        maskComposite: "intersect",
        WebkitMaskImage: `
          radial-gradient(circle at 125px 0, transparent 6px, black 6.5px),
          radial-gradient(circle at 125px 100%, transparent 6px, black 6.5px),
          radial-gradient(circle at 0 50%, transparent 3.5px, black 4px),
          radial-gradient(circle at 100% 50%, transparent 3.5px, black 4px)
        `,
        WebkitMaskSize: "100% 100%, 100% 100%, 100% 12px, 100% 12px",
        WebkitMaskComposite: "destination-in",
      }}
      className={`relative h-[152px] w-full overflow-hidden rounded-md bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 shadow-md text-white select-none px-2.5 ${
        disabled ? "opacity-60 grayscale pointer-events-none" : ""
      }`}
    >
      {/* Background Patterns */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        aria-hidden="true"
      >
        <Shirt className="absolute -top-6 -left-4 w-20 h-20 rotate-12" />
        <Tag className="absolute -bottom-6 -right-3 w-24 h-24 -rotate-12" />
      </div>
      <SportNexusLogoIcon
        className="pointer-events-none absolute -bottom-4 -left-3 w-28 h-auto rotate-6 opacity-20"
        aria-hidden="true"
      />
      <SportNexusLogoIcon
        className="pointer-events-none absolute -top-4 right-11 w-28 h-auto rotate-6 opacity-20"
        aria-hidden="true"
      />

      {/* Badge Trạng thái */}
      {statusLabel && (
        <span className="absolute top-1.5 right-2 z-10 rounded-full bg-black/30 px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm">
          {statusLabel}
        </span>
      )}

      {/* Badge Số lần đổi (chỉ quà tặng) */}
      {coupon.quantity > 1 && (
        <span className="absolute top-1.5 left-2 z-10 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
          x{coupon.quantity}
        </span>
      )}

      <div className="relative flex h-full items-stretch">
        {/* Cột Trái: Nút In + Giá trị giảm */}
        <div className="flex w-[115px] shrink-0 flex-col justify-center items-center gap-0.5 px-1 py-2 text-center border-r border-dashed border-white/30">
          {/* Nút In phiếu (Chỉ hiển thị khi showPrint = true) */}
          {showPrint && (
            <button
              onClick={handlePrint}
              disabled={disabled}
              className="no-print inline-flex items-center justify-center gap-1 px-2 py-0.5 mb-1 rounded border border-white/60 bg-white/10 hover:bg-white hover:text-blue-600 text-[10px] font-semibold text-white transition-colors cursor-pointer"
              title={t("print_store_voucher")}
            >
              <Printer className="w-3 h-3" />
              <span>{t("print_voucher")}</span>
            </button>
          )}

          <span className="text-[10px] font-medium uppercase tracking-wider text-white/85">
            {t("discount_voucher")}
          </span>
          <span className="text-xl font-black leading-none drop-shadow-sm my-0.5">
            {coupon.discount_type === "PERCENTAGE"
              ? `-${coupon.discount_value}%`
              : `-${formatCurrency(coupon.discount_value)}`}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-tight text-white/85">
            {t("on_order")}
          </span>
        </div>

        {/* Cột Phải: Thông tin & Hành động */}
        <div className="flex flex-1 flex-col justify-between p-2.5 pl-3.5">
          {/* Hàng 1: Mã Code + Nút Sao chép */}
          <div className="flex items-center gap-1.5 h-7">
            <span className="flex-1 truncate rounded bg-white/15 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white text-center">
              {locked ? "••••••••••••" : coupon.code}
            </span>
            <button
              onClick={handleCopy}
              disabled={disabled || locked}
              className={`no-print shrink-0 inline-flex items-center justify-center gap-1 h-full rounded border border-white/60 px-2 text-[10px] font-semibold text-white hover:bg-white hover:text-blue-600 transition-colors cursor-pointer ${
                locked ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{t("copied")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t("copy")}</span>
                </>
              )}
            </button>
          </div>

          {/* Hàng 2: Chi tiết điều kiện */}
          <div className="flex flex-col gap-0.5 text-[11px] text-white/95 leading-tight my-auto">
            <p className="truncate">
              {coupon.discount_type === "PERCENTAGE"
                ? `${t("max_discount")} ${formatCurrency(coupon.max_discount)}`
                : t("direct_discount")}
            </p>
            <p className="truncate">
              {t("min_order")} {formatCurrency(coupon.min_order_value)}
            </p>
            <p className="truncate">
              {t("expiry")}: {formatDate(coupon.end_date)} ·{" "}
              {coupon.usage_count}/{coupon.usage_limit}
            </p>
          </div>

          {/* Hàng 3: Nút Lưu / Đã lưu + Xóa */}
          <div className="no-print h-7 w-full">
            {locked ? (
              <div className="flex h-full w-full items-center justify-center gap-1 rounded-lg border border-white/40 bg-white/5 px-2.5 text-[11px] font-semibold text-white/90">
                <Lock className="w-3.5 h-3.5" />
                <span>{t("locked_code")}</span>
              </div>
            ) : saved ? (
              <div className="flex h-full w-full items-stretch rounded-lg overflow-hidden border border-white shadow-sm">
                <div className="flex flex-1 items-center justify-center gap-1 bg-white text-blue-600 px-2 text-[11px] font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t("saved_label")}</span>
                </div>
                <button
                  onClick={() => toggleSave(coupon)}
                  disabled={disabled}
                  title={t("remove_from_saved")}
                  className="flex items-center justify-center bg-blue-600/80 hover:bg-red-600 px-2.5 text-white/90 hover:text-white transition-colors border-l border-blue-400/30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleSave(coupon)}
                disabled={disabled}
                className="h-full w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/60 bg-white/5 px-2.5 text-[11px] font-semibold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t("save_code")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
