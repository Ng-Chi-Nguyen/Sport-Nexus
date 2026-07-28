export const Card = ({ title, icon, action, children, className = "" }) => (
  <section
    className={`rounded-2xl border border-slate-900 bg-[#0D121F]/85 p-4 shadow-xl backdrop-blur-md ${className}`}
  >
    {title && (
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-1.5 text-sky-400">
            {icon}
          </div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
