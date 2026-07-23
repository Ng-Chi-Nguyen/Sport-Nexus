import { NavLink } from "react-router-dom";
import { mainNavItems } from "@/constants/adminMenuConfig";

const BottomNav = () => {
  const allItems = mainNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D121F]/95 border-t border-slate-800 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] overflow-x-auto scrollbar-hide">
      <div className="flex items-center h-16 px-2 w-max min-w-full gap-1">
        {allItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? "text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="text-[10px] font-semibold truncate max-w-full leading-tight">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
