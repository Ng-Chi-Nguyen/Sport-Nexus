import { Home, Building2, Briefcase } from "lucide-react";

const OPTIONS = [
  { value: "home", label: "Nhà riêng", icon: Home },
  { value: "office", label: "Văn phòng", icon: Building2 },
  { value: "company", label: "Công ty", icon: Briefcase },
];

const TypeSelect = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
        Loại địa chỉ
      </label>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                value === opt.value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
            >
              <Icon size={14} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeSelect;
