import { Home, Building2, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  { value: "home", labelKey: "component.common.home_address", icon: Home },
  { value: "office", labelKey: "component.common.office_address", icon: Building2 },
  { value: "company", labelKey: "component.common.company_address", icon: Briefcase },
];

const TypeSelect = ({ value, onChange }) => {
  const { t } = useTranslation("translation", { keyPrefix: "component.common" });
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
        {t("address_type")}
      </label>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                isSelected
                  ? "border-sky-500 bg-sky-50 text-sky-600 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-400"
                  : "border-slate-300 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-800 dark:text-slate-400 dark:bg-[#111827]/40 dark:hover:bg-[#161F32] dark:hover:text-slate-200"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{t(opt.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeSelect;
