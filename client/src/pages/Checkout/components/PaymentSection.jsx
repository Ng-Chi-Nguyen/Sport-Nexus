import { CreditCard, Truck, Building, Smartphone, Wallet } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "COD", label: "Thanh toán khi nhận hàng", icon: Truck },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: Building },
  { value: "MOMO", label: "Ví MoMo", icon: Smartphone },
  { value: "VNPAY", label: "VNPay", icon: Wallet },
];

const PaymentSection = ({ value, onChange }) => (
  <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
      <CreditCard size={16} />
      Phương thức thanh toán
    </h2>
    <div className="space-y-2.5">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isSelected = value === method.value;
        return (
          <label
            key={method.value}
            className={`flex items-center gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-colors ${
              isSelected
                ? "border-sky-500 bg-sky-50/50 dark:bg-sky-500/10 dark:border-sky-500/40"
                : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#111827]/40"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={isSelected}
              onChange={(e) => onChange(e.target.value)}
              className="accent-sky-600 dark:accent-sky-500"
            />
            <Icon
              size={18}
              className={
                isSelected
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-slate-400 dark:text-slate-500"
              }
            />
            <span
              className={`text-sm font-medium ${isSelected ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-700 dark:text-slate-300"}`}
            >
              {method.label}
            </span>
          </label>
        );
      })}
    </div>
  </div>
);

export default PaymentSection;
