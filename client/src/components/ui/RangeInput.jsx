const RangeInput = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholderMin = "Tối thiểu",
  placeholderMax = "Tối đa",
  type = "number",
}) => {
  return (
    <div>
      <label className="label-filter">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type={type}
          placeholder={placeholderMin}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className="input-dark"
        />
        <span className="text-slate-600 shrink-0">–</span>
        <input
          type={type}
          placeholder={placeholderMax}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className="input-dark"
        />
      </div>
    </div>
  );
};

export default RangeInput;
