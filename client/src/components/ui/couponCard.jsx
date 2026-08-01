import { useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  Printer,
  Shirt,
  Tag,
  Trash2,
} from "lucide-react";
import { useCoupons } from "@/contexts/CouponContext";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { SportNexusLogoIcon } from "@/components/logo";

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

  // Logic in thẻ giống hệt 100% giao diện màn hình
  // Logic in phiếu vừa vặn kích thước thật
  const handlePrint = () => {
    if (disabled) return;

    const couponElement = document.getElementById(`coupon-card-${coupon.code}`);
    if (!couponElement) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    // Thu thập tất cả StyleSheet/Tailwind từ document chính
    const styleSheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("");
        } catch (e) {
          return "";
        }
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Phiếu Giảm Giá - ${coupon.code}</title>
          <style>
            ${styleSheets}
            
            /* THIẾT LẬP KHỔ GIẤY VỪA VẶN MÁY IN */
            @page {
              size: 105mm 45mm; /* Kích thước vừa khít phiếu */
              margin: 0;       /* Loại bỏ lề trắng mặc định của máy in */
            }

            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Container ôm sát phiếu */
            .print-container {
              width: 100mm;
              height: 40mm;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            /* Ép thẻ coupon lấp đầy khung in */
            .print-container > div {
              width: 100% !important;
              height: 100% !important;
              box-shadow: none !important;
            }

            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${couponElement.outerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
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

      <div className="relative flex h-full items-stretch">
        {/* Cột Trái: Nút In + Giá trị giảm */}
        <div className="flex w-[115px] shrink-0 flex-col justify-center items-center gap-0.5 px-1 py-2 text-center border-r border-dashed border-white/30">
          {/* Nút In phiếu (Ẩn khi in ra giấy nhờ class no-print) */}
          <button
            onClick={handlePrint}
            disabled={disabled}
            className="no-print inline-flex items-center justify-center gap-1 px-2 py-0.5 mb-1 rounded border border-white/60 bg-white/10 hover:bg-white hover:text-blue-600 text-[10px] font-semibold text-white transition-colors"
            title="In phiếu mua tại cửa hàng"
          >
            <Printer className="w-3 h-3" />
            <span>In phiếu</span>
          </button>

          <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">
            Phiếu giảm giá
          </span>
          <span className="text-xl font-black leading-none drop-shadow-sm my-0.5">
            {coupon.discount_type === "PERCENTAGE"
              ? `-${coupon.discount_value}%`
              : `-${formatCurrency(coupon.discount_value)}`}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-tight text-white/80">
            Trên đơn hàng
          </span>
        </div>

        {/* Cột Phải: Thông tin & Hành động */}
        <div className="flex flex-1 flex-col justify-between p-2.5 pl-3.5">
          {/* Hàng 1: Mã Code + Nút Sao chép */}
          <div className="flex items-center gap-1.5 h-7">
            <span className="flex-1 truncate rounded bg-white/15 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white text-center">
              {coupon.code}
            </span>
            <button
              onClick={handleCopy}
              disabled={disabled}
              className="no-print shrink-0 inline-flex items-center justify-center gap-1 h-full rounded border border-white/60 px-2 text-[10px] font-semibold text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Hàng 2: Chi tiết điều kiện */}
          <div className="flex flex-col gap-0.5 text-[11px] text-white/90 leading-tight my-auto">
            <p className="truncate">
              {coupon.discount_type === "PERCENTAGE"
                ? `Tối đa giảm: ${formatCurrency(coupon.max_discount)}`
                : "Giảm trực tiếp vào đơn hàng"}
            </p>
            <p className="truncate">
              Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}
            </p>
            <p className="truncate">
              HSD: {formatDate(coupon.end_date)} · {coupon.usage_count}/
              {coupon.usage_limit}
            </p>
          </div>

          {/* Hàng 3: Nút Lưu / Đã lưu + Xóa (Ẩn khi in nhờ class no-print) */}
          <div className="no-print h-7 w-full">
            {saved ? (
              <div className="flex h-full w-full items-stretch rounded-lg overflow-hidden border border-white shadow-sm">
                <div className="flex flex-1 items-center justify-center gap-1 bg-white text-blue-600 px-2 text-[11px] font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Đã lưu</span>
                </div>
                <button
                  onClick={() => toggleSave(coupon)}
                  disabled={disabled}
                  title="Xóa khỏi danh sách lưu"
                  className="flex items-center justify-center bg-blue-600/80 hover:bg-red-600 px-2.5 text-white/90 hover:text-white transition-colors border-l border-blue-400/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleSave(coupon)}
                disabled={disabled}
                className="h-full w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/60 bg-white/5 px-2.5 text-[11px] font-semibold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Lưu mã</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
