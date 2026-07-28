export const ProgressBar = ({ label, count, valueText, color, percent }) => (
  <div className="space-y-1 text-xs">
    <div className="flex justify-between">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className="font-semibold text-slate-200">{valueText || count}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-900 border border-slate-800 p-0.5">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);
