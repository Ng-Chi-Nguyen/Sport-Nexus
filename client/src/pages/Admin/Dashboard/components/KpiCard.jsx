import React from "react";

export const KpiCard = ({ label, value, icon, tone }) => (
  <div
    className={`rounded-xl border bg-gradient-to-br ${tone} to-transparent p-3 shadow-sm transition-colors duration-200`}
  >
    <div className="flex items-start justify-between gap-1">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
          {value}
        </p>
      </div>
      <div
        className="rounded-lg border p-1.5 transition-colors duration-200
                      bg-slate-100 border-slate-200 text-slate-700
                      dark:bg-white/5 dark:border-white/10 dark:text-slate-300"
      >
        {icon}
      </div>
    </div>
  </div>
);
