import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProvinceSelect = ({
  provinces = [],
  provinceValue,
  onProvinceChange,
  wards = [],
  wardValue,
  onWardChange,
  square = false,
}) => {
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const { t } = useTranslation("translation", { keyPrefix: "component.common" });

  const fieldClass = square ? "rounded-none" : "rounded";

  const provinceRef = useRef(null);
  const wardRef = useRef(null);

  const selectedProvince = provinces.find((p) => p.Code === provinceValue);
  const selectedWard = wards.find((w) => w.Code === wardValue);

  // Tá»± Ä‘á»™ng Ä‘Ă³ng dropdown khi click ra ngoĂ i vĂ¹ng chá»n
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target)) {
        setProvinceOpen(false);
      }
      if (wardRef.current && !wardRef.current.contains(event.target)) {
        setWardOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Chá»n Tá»‰nh / ThĂ nh phá»‘ */}
      <div className="relative" ref={provinceRef}>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
          {t("province_label")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => {
            setProvinceOpen(!provinceOpen);
            setWardOpen(false);
          }}
          className={`w-full px-3 py-2 border ${fieldClass} text-sm flex items-center justify-between transition-colors duration-200
                     bg-slate-50 border-slate-300 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white
                     dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50`}
        >
          <span
            className={
              provinceValue
                ? "text-slate-800 dark:text-slate-200"
                : "text-slate-400 dark:text-slate-500"
            }
          >
            {provinceValue
              ? selectedProvince?.FullName
              : t("choose_province")}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
              provinceOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {provinceOpen && (
          <div
            className={`absolute z-20 mt-1 w-full ${fieldClass} border shadow-lg max-h-48 overflow-y-auto custom-scrollbar
                          bg-white border-slate-200 
                          dark:bg-[#0D121F] dark:border-slate-800 dark:shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
          >
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
                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                  provinceValue === p.Code
                    ? "bg-sky-50 text-sky-600 font-semibold dark:bg-sky-500/10 dark:text-sky-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                {p.FullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chá»n PhÆ°á»ng / XĂ£ */}
      <div className="relative" ref={wardRef}>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
          {t("ward_label")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          disabled={!provinceValue}
          onClick={() => {
            setWardOpen(!wardOpen);
            setProvinceOpen(false);
          }}
          className={`w-full px-3 py-2 border ${fieldClass} text-sm flex items-center justify-between transition-colors duration-200
                     bg-slate-50 border-slate-300 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white
                     disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
                     dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50
                     dark:disabled:bg-slate-900/40 dark:disabled:text-slate-600`}
        >
          <span
            className={
              wardValue
                ? "text-slate-800 dark:text-slate-200"
                : "text-slate-400 dark:text-slate-500"
            }
          >
            {wardValue && selectedWard
              ? selectedWard.FullName
              : t("choose_ward")}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
              wardOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {wardOpen && (
          <div
            className={`absolute z-20 mt-1 w-full ${fieldClass} border shadow-lg max-h-48 overflow-y-auto custom-scrollbar
                          bg-white border-slate-200 
                          dark:bg-[#0D121F] dark:border-slate-800 dark:shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
          >
            {wards.map((w) => (
              <button
                key={w.Code}
                type="button"
                onClick={() => {
                  onWardChange(w.Code);
                  setWardOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                  wardValue === w.Code
                    ? "bg-sky-50 text-sky-600 font-semibold dark:bg-sky-500/10 dark:text-sky-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
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
