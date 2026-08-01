import React from "react";
import { useTranslation } from "react-i18next";

const RangeInput = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
  type = "number",
}) => {
  const { t } = useTranslation("translation", { keyPrefix: "component.common" });
  return (
    <div>
      {label && <label className="label-filter">{label}</label>}
      <div className="flex items-center gap-1.5">
        <input
          type={type}
          placeholder={placeholderMin ?? t("min_placeholder")}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className="input-dark"
        />
        <span className="text-slate-400 dark:text-slate-600 shrink-0 font-bold">
          –
        </span>
        <input
          type={type}
          placeholder={placeholderMax ?? t("max_placeholder")}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className="input-dark"
        />
      </div>
    </div>
  );
};

export default RangeInput;
