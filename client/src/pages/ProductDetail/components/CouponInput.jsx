import { Tag, CheckCircle, XCircle } from "lucide-react";
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
}) => {
  const hasCouponApplied = discount !== null && discount !== undefined;

  return (
    <div className="py-2 text-slate-800 dark:text-slate-100 transition-colors duration-200">
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
              if (!hasCouponApplied) onCodeChange(e.target.value);
            }}
            placeholder="Nhập mã giảm giá"
            disabled={hasCouponApplied}
            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-colors duration-200"
            onKeyDown={(e) =>
              e.key === "Enter" && !hasCouponApplied && onApply()
            }
          />
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
            onClick={onApply}
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
