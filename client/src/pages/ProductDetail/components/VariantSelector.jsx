const VariantSelector = ({
  attrKeys,
  selectedAttrs,
  availableValues = {},
  onSelect,
}) => {
  if (!attrKeys || attrKeys.length === 0) return null;

  return attrKeys.map((attr) => {
    const avail = availableValues[attr.name];
    return (
      <div
        key={attr.id}
        className="space-y-2 text-slate-800 dark:text-slate-100 transition-colors duration-200"
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {attr.name}
          {attr.unit && (
            <span className="font-normal text-slate-400 dark:text-slate-500 ml-1">
              ({attr.unit})
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {attr.values.map((opt) => {
            const isSelected = selectedAttrs[attr.name] === opt.value;
            const isAvailable = !avail || avail.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!isAvailable && !isSelected}
                onClick={() => onSelect(attr.name, opt.value)}
                className={`px-4 py-2 text-sm border rounded-xl transition-all ${
                  isSelected
                    ? "border-sky-500 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold shadow-sm"
                    : isAvailable
                      ? "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-500/50 bg-slate-50 dark:bg-[#111827]/40 cursor-pointer shadow-sm"
                      : "border-slate-200 dark:border-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/20"
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
