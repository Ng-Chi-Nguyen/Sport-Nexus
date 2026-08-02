import { useEffect, useState } from "react";
import { CreditCard, Truck, Building, Smartphone, Wallet } from "lucide-react";
import paymentApi from "@/api/customer/paymentApi";

const FALLBACK_METHODS = [
  { value: "COD", label: "Thanh toán khi nhận hàng", icon: Truck },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: Building },
  { value: "MOMO", label: "Ví MoMo", icon: Smartphone },
  { value: "CREDIT_CARD", label: "Thẻ ATM / quốc tế", icon: CreditCard },
  { value: "VNPAY", label: "VNPay", icon: Wallet },
];

const PaymentSection = ({ value, onChange }) => {
  const [methods, setMethods] = useState(FALLBACK_METHODS);

  useEffect(() => {
    let cancelled = false;
    paymentApi
      .getMethods()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data;
        if (!Array.isArray(list) || list.length === 0) return;
        const icons = Object.fromEntries(
          FALLBACK_METHODS.map((m) => [m.value, m.icon]),
        );
        setMethods(
          list.map((m) => ({
            value: m.value,
            label: m.label,
            icon: icons[m.value] || Building,
            manual: m.manual,
          })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        <CreditCard size={16} />
        Phương thức thanh toán
      </h2>
      <div className="space-y-2.5">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.value;
          return (
            <label
              key={method.value}
              className={`flex items-center gap-3.5 p-3.5 border cursor-pointer transition-colors ${
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
              <div className="flex-1">
                <span
                  className={`block text-sm font-medium ${
                    isSelected
                      ? "text-slate-900 dark:text-slate-100 font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {method.label}
                </span>
                {method.manual && (
                  <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Quét mã QR bằng app ngân hàng
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentSection;