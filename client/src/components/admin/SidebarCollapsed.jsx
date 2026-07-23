import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { getSidebarSections } from "@/constants/adminMenuConfig";

const SidebarCollapsed = () => {
  const sections = getSidebarSections();
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-16 h-full bg-[#0D121F] border-r border-slate-900 flex flex-col items-center py-4 gap-2 shrink-0 relative">
      <Link
        to="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg mb-2"
      >
        <span className="font-black text-base tracking-tighter italic">SN</span>
      </Link>

      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto custom-scrollbar w-full px-2">
        {sections.map((section) =>
          section.items.map((item) => (
            <div key={item.path} className="relative w-full flex justify-center">
              <NavLink
                to={item.path}
                onPointerEnter={() => setTooltip(item.label)}
                onPointerLeave={() => setTooltip(null)}
                onFocus={() => setTooltip(item.label)}
                onBlur={() => setTooltip(null)}
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-lg transition-all text-lg ${
                    isActive
                      ? "bg-[#161F32] text-sky-400"
                      : "text-slate-500 hover:bg-[#111827] hover:text-slate-200"
                  }`
                }
              >
                {item.icon}
              </NavLink>
              {tooltip === item.label && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarCollapsed;
