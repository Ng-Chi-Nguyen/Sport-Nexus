import { useRef, useState, useEffect, useMemo } from "react";
import { Tag, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const CouponInput = ({
  couponCode,
  onCodeChange,
  onApply,
  onClear,
  message,
  loading,
  discount,
  oldAmount,
  newAmount,
  suggestions = [],
  suggestionsLoading = false,
}) => {
  const hasCouponApplied = discount !== null && discount !== undefined;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((c) =>
      String(c.code || "").toLowerCase().includes(q),
    );
  }, [suggestions, query]);

  const handleSelect = (code) => {
    if (hasCouponApplied) return;
    setQuery("");
    setOpen(false);
    onCodeChange(code);
    onApply(code);
  };

  const showDropdown = open && !hasCouponApplied && filtered.length > 0;

  return (
    <div ref={containerRef} className="py-2 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              if (hasCouponApplied) return;
              onCodeChange(e.target.value);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (!hasCouponApplied) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !hasCouponApplied) onApply(couponCode);
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Nhập mã giảm giá"
            disabled={hasCouponApplied}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-colors duration-200"
          />
          <ChevronDown
            size={16}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
          {showDropdown && (
            <ul className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg">
              {suggestionsLoading && (
                <li className="px-3.5 py-2.5 text-xs text-slate-400 dark:text-slate-500">
                  Đang tải danh sách mã...
                </li>
              )}
              {!suggestionsLoading &&
                filtered.map((coupon) => (
                  <li
                    key={coupon.code}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(coupon.code);
                    }}
                    className="px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{coupon.code}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                        {coupon.discount_type === "PERCENTAGE"
                          ? `Giảm ${coupon.discount_value}%`
                          : formatCurrency(coupon.discount_value)}
                      </span>
                    </div>
                    {coupon.min_order_value > 0 && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Đơn tối thiểu {formatCurrency(coupon.min_order_value)}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {hasCouponApplied ? (
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
          >
            Huỷ
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onApply(couponCode)}
            disabled={loading || !couponCode.trim()}
            className="px-4 py-2.5 text-sm font-medium text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-sm"
          >
            {loading ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
        )}
      </div>

      {hasCouponApplied && (
        <div className="mt-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-1.5 transition-colors duration-200">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle size={16} />
            <span>
              Đã áp dụng mã{" "}
              <strong className="font-semibold">{couponCode}</strong>
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-6">
            <p>
              Giá gốc:{" "}
              <span className="line-through text-slate-400 dark:text-slate-500">
                {formatCurrency(oldAmount)}
              </span>
            </p>
            <p>
              Giá sau giảm:{" "}
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {formatCurrency(newAmount)}
              </span>
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              Tiết kiệm: {formatCurrency(discount)}
            </p>
          </div>
        </div>
      )}

      {!hasCouponApplied && message && (
        <p
          className={`mt-2 text-xs flex items-center gap-1.5 ${message.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
        >
          {message.type === "error" && <XCircle size={14} />}
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
