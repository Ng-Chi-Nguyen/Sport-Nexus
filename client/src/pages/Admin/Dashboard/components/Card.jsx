export const Card = ({ title, icon, action, children, className = "" }) => (
  <section
    className={`rounded-2xl border transition-colors duration-200
                bg-white border-slate-200 shadow-sm text-slate-800
                dark:bg-[#0D121F]/85 dark:border-slate-900 dark:shadow-xl dark:text-slate-100 dark:backdrop-blur-md 
                p-4 ${className}`}
  >
    {title && (
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className="rounded-lg border p-1.5 transition-colors duration-200
                            bg-sky-50 border-sky-200 text-sky-600
                            dark:bg-slate-900/80 dark:border-slate-800 dark:text-sky-400"
            >
              {icon}
            </div>
          )}
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
