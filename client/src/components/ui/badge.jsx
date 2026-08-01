const Badge = ({ children, color = "gray", className = "" }) => {
  // Bảng màu hỗ trợ cả Light Mode và Dark Mode
  const colorMap = {
    gray: "bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
    red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
    yellow:
      "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20",
    green:
      "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-500/20",
    green_bold:
      "bg-green-100 text-green-800 ring-green-700/30 dark:bg-green-600/10 dark:text-green-500 dark:ring-green-900/30",
    blue: "bg-blue-50 text-blue-700 ring-blue-700/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30",
    indigo:
      "bg-indigo-50 text-indigo-700 ring-indigo-700/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30",
    purple:
      "bg-purple-50 text-purple-700 ring-purple-700/20 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/30",
    pink: "bg-pink-50 text-pink-700 ring-pink-700/20 dark:bg-pink-400/10 dark:text-pink-400 dark:ring-pink-400/20",
    orange:
      "bg-orange-50 text-orange-800 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20",
    teal: "bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-400 dark:ring-teal-400/20",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-cyan-400/20",
    lime: "bg-lime-50 text-lime-800 ring-lime-600/20 dark:bg-lime-400/10 dark:text-lime-500 dark:ring-lime-400/20",
    fuchsia:
      "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-400 dark:ring-fuchsia-400/20",
    slate:
      "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20",

    // Nhóm Huy hiệu đặc biệt (Hạng/Giải thưởng)
    gold: "bg-amber-100 text-amber-900 ring-amber-500/30 font-bold dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/30",
    silver:
      "bg-slate-200 text-slate-800 ring-slate-400/30 font-bold dark:bg-slate-300/10 dark:text-slate-300 dark:ring-slate-300/30",
    bronze:
      "bg-amber-900/10 text-amber-900 ring-amber-800/30 font-bold dark:bg-orange-700/10 dark:text-orange-400 dark:ring-orange-700/30",

    // Nhóm Trạng thái Hệ thống
    success:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    warning:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-500 dark:ring-amber-400/20",
    error:
      "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20",
    info: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-sky-400/20",

    // Màu thương hiệu Sport Nexus
    nexus:
      "bg-sky-50 text-sky-600 ring-sky-500/30 dark:bg-[#4facf3]/10 dark:text-[#4facf3] dark:ring-[#4facf3]/30",
  };

  const selectedColor = colorMap[color] || colorMap.gray;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset w-fit transition-colors duration-200 ${selectedColor} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
