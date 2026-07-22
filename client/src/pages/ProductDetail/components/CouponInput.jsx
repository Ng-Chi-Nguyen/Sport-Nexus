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
    <div className="py-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              if (!hasCouponApplied) onCodeChange(e.target.value);
            }}
            placeholder="Nhập mã giảm giá"
            disabled={hasCouponApplied}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-500"
            onKeyDown={(e) => e.key === "Enter" && !hasCouponApplied && onApply()}
          />
        </div>

        {hasCouponApplied ? (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-sm hover:bg-red-50 transition-colors shrink-0"
          >
            Huỷ
          </button>
        ) : (
          <button
            onClick={onApply}
            disabled={loading || !couponCode.trim()}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
        )}
      </div>

      {hasCouponApplied && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-sm space-y-1">
          <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
            <CheckCircle size={16} />
            <span>
              Đã áp dụng mã <strong>{couponCode}</strong>
            </span>
          </div>
          <div className="text-sm text-slate-600 space-y-0.5 ml-6">
            <p>
              Giá gốc:{" "}
              <span className="line-through">{formatCurrency(oldAmount)}</span>
            </p>
            <p>
              Giá sau giảm:{" "}
              <span className="text-red-600 font-semibold">
                {formatCurrency(newAmount)}
              </span>
            </p>
            <p className="text-green-600 font-medium">
              Tiết kiệm: {formatCurrency(discount)}
            </p>
          </div>
        </div>
      )}

      {!hasCouponApplied && message && (
        <p
          className={`mt-1 text-xs flex items-center gap-1 ${message.type === "success" ? "text-green-600" : "text-red-500"}`}
        >
          {message.type === "error" && <XCircle size={12} />}
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
