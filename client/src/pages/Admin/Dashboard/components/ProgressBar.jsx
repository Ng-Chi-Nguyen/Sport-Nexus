import React from "react";

export const ProgressBar = ({ label, count, valueText, color, percent }) => (
  <div className="space-y-1 text-xs">
    <div className="flex justify-between">
      <span className="text-slate-600 dark:text-slate-300 font-medium">
        {label}
      </span>
      <span className="font-semibold text-slate-800 dark:text-slate-200">
        {valueText || count}
      </span>
    </div>
    <div
      className="h-2 rounded-full border p-0.5 transition-colors duration-200
                    bg-slate-100 border-slate-200
                    dark:bg-slate-900 dark:border-slate-800"
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);
