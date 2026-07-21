import { Tag } from "lucide-react";

const CouponInput = ({ couponCode, onCodeChange, onApply, message }) => (
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
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Nhập mã giảm giá"
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-400"
          onKeyDown={(e) => e.key === "Enter" && onApply()}
        />
      </div>
      <button
        onClick={onApply}
        className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-sm hover:bg-blue-50 transition-colors"
      >
        Áp dụng
      </button>
    </div>
    {message && (
      <p
        className={`mt-1 text-xs ${message.type === "success" ? "text-green-600" : "text-red-500"}`}
      >
        {message.text}
      </p>
    )}
  </div>
);

export default CouponInput;
