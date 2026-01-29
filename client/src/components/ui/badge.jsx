const Badge = ({ children, color = "gray" }) => {
  // Định nghĩa bảng màu dựa trên mã bạn đã gửi
  const colorMap = {
    gray: "bg-gray-400/10 text-gray-400 inset-ring-gray-400/20 w-fit",
    red: "bg-red-400/10 text-red-400 inset-ring-red-400/20 w-fit",
    yellow: "bg-yellow-400/10 text-yellow-500 inset-ring-yellow-400/20 w-fit",
    green: "bg-green-400/10 text-green-400 inset-ring-green-500/20 w-fit",
    blue: "bg-blue-400/10 text-blue-400 inset-ring-blue-400/30 w-fit",
    indigo: "bg-indigo-400/10 text-indigo-400 inset-ring-indigo-400/30 w-fit",
    purple: "bg-purple-400/10 text-purple-400 inset-ring-purple-400/30 w-fit",
    pink: "bg-pink-400/10 text-pink-400 inset-ring-pink-400/20 w-fit",

    orange: "bg-orange-400/10 text-orange-400 inset-ring-orange-400/20 w-fit",
    teal: "bg-teal-400/10 text-teal-400 inset-ring-teal-400/20 w-fit",
    cyan: "bg-cyan-400/10 text-cyan-400 inset-ring-cyan-400/20 w-fit",
    lime: "bg-lime-400/10 text-lime-500 inset-ring-lime-400/20 w-fit",
    fuchsia:
      "bg-fuchsia-400/10 text-fuchsia-400 inset-ring-fuchsia-400/20 w-fit",
    slate: "bg-slate-400/10 text-slate-400 inset-ring-slate-400/20 w-fit",

    gold: "bg-yellow-500/10 text-yellow-600 inset-ring-yellow-500/30 w-fit font-bold",
    silver:
      "bg-slate-300/10 text-slate-500 inset-ring-slate-300/30 w-fit font-bold",
    bronze:
      "bg-orange-700/10 text-orange-700 inset-ring-orange-700/30 w-fit font-bold",

    success: "bg-emerald-400/10 text-emerald-500 inset-ring-emerald-400/20",
    warning: "bg-amber-400/10 text-amber-600 inset-ring-amber-400/20",
    error: "bg-rose-400/10 text-rose-500 inset-ring-rose-400/20",
    info: "bg-sky-400/10 text-sky-500 inset-ring-sky-400/20",

    // Thêm màu chủ đạo cho Sport Nexus
    nexus: "bg-[#4facf3]/10 text-[#4facf3] inset-ring-[#4facf3]/30 w-fit",
  };

  const selectedColor = colorMap[color] || colorMap.gray;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring ${selectedColor}`}
    >
      {children}
    </span>
  );
};

export default Badge;
