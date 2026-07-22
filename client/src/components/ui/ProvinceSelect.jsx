import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ProvinceSelect = ({
  provinces,
  provinceValue,
  onProvinceChange,
  wards,
  wardValue,
  onWardChange,
}) => {
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);

  const selectedProvince = provinces.find((p) => p.Code === provinceValue);
  const selectedWard = wards.find((w) => w.Code === wardValue);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Tỉnh/Thành phố */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => {
            setProvinceOpen(!provinceOpen);
            setWardOpen(false);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm flex items-center justify-between bg-white focus:outline-none focus:border-blue-600 text-slate-800"
        >
          <span className={provinceValue ? "" : "text-slate-400"}>
            {provinceValue
              ? selectedProvince?.FullName
              : "Chọn Tỉnh/Thành phố"}
          </span>
          <ChevronDown size={16} className="text-slate-400 shrink-0" />
        </button>
        {provinceOpen && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
            {provinces.map((p) => (
              <button
                key={p.Code}
                type="button"
                onClick={() => {
                  onProvinceChange(p.Code);
                  onWardChange("");
                  setProvinceOpen(false);
                  setWardOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                  provinceValue === p.Code
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-700"
                }`}
              >
                {p.FullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phường/Xã */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          disabled={!provinceValue}
          onClick={() => {
            setWardOpen(!wardOpen);
            setProvinceOpen(false);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm flex items-center justify-between bg-white focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400 text-slate-800"
        >
          <span className={wardValue ? "" : "text-slate-400"}>
            {wardValue && selectedWard
              ? selectedWard.FullName
              : "Chọn Phường/Xã"}
          </span>
          <ChevronDown size={16} className="text-slate-400 shrink-0" />
        </button>
        {wardOpen && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
            {wards.map((w) => (
              <button
                key={w.Code}
                type="button"
                onClick={() => {
                  onWardChange(w.Code);
                  setWardOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                  wardValue === w.Code
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-700"
                }`}
              >
                {w.FullName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvinceSelect;
