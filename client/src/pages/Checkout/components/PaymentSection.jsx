import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PAYMENT_METHODS } from "@/constants/payment";

const PaymentSection = ({ value, onChange }) => {
  const { t } = useTranslation();
  const methods = PAYMENT_METHODS.map((m) => ({
    ...m,
    label: t(m.labelKey),
  }));

  return (
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        <CreditCard size={16} />
        {t("payment_method")}
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
                    {t("bank_transfer_desc")}
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
