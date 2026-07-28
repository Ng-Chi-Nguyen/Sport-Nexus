export const KpiCard = ({ label, value, icon, tone }) => (
  <div
    className={`rounded-xl border bg-gradient-to-br ${tone} to-transparent p-3 shadow-sm`}
  >
    <div className="flex items-start justify-between gap-1">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-bold text-slate-100">{value}</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300">
        {icon}
      </div>
    </div>
  </div>
);
