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
