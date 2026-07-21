const VariantSelector = ({ attrKeys, selectedAttrs, availableValues = {}, onSelect }) => {
  if (!attrKeys || attrKeys.length === 0) return null;

  return attrKeys.map((attr) => {
    const avail = availableValues[attr.name];
    return (
      <div key={attr.id}>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          {attr.name}
          {attr.unit && (
            <span className="font-normal text-slate-400 ml-1">({attr.unit})</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {attr.values.map((opt) => {
            const isSelected = selectedAttrs[attr.name] === opt.value;
            const isAvailable = !avail || avail.has(opt.value);
            return (
              <button
                key={opt.value}
                disabled={!isAvailable && !isSelected}
                onClick={() => onSelect(attr.name, opt.value)}
                className={`px-4 py-2 text-sm border rounded-sm transition-all
                  ${isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                    : isAvailable
                      ? "border-slate-300 text-slate-600 hover:border-slate-400 cursor-pointer"
                      : "border-slate-200 text-slate-300 cursor-not-allowed"
                  }`}
              >
                {opt.value}
              </button>
            );
          })}
        </div>
      </div>
    );
  });
};

export default VariantSelector;
