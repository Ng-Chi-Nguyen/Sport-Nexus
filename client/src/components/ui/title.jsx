const TitleManagement = (props) => {
  const { children, color } = props;

  // Khai báo đầy đủ tên class để Tailwind có thể nhận diện khi build
  const colorMap = {
    blue: {
      border: "border-blue-500",
      text: "text-blue-600",
      bgSpan: "bg-blue-500",
    },
    orange: {
      border: "border-orange-500",
      text: "text-orange-600",
      bgSpan: "bg-orange-500",
    },
    emerald: {
      border: "border-emerald-500",
      text: "text-emerald-600",
      bgSpan: "bg-emerald-500",
    },
    red: {
      border: "border-red-500",
      text: "text-red-600",
      bgSpan: "bg-red-500",
    },
    violet: {
      border: "border-violet-500",
      text: "text-violet-600",
      bgSpan: "bg-violet-500",
    },
    amber: {
      border: "border-amber-500",
      text: "text-amber-600",
      bgSpan: "bg-amber-500",
    },
    cyan: {
      border: "border-cyan-500",
      text: "text-cyan-600",
      bgSpan: "bg-cyan-500",
    },
    pink: {
      border: "border-pink-500",
      text: "text-pink-600",
      bgSpan: "bg-pink-500",
    },
    slate: {
      border: "border-slate-500",
      text: "text-slate-600",
      bgSpan: "bg-slate-500",
    },
  };

  const styles = colorMap[color] || colorMap.blue;

  return (
    <h3
      className={`font-black text-[11px] uppercase border-b-2 ${styles.border} 
      pb-2 mb-4 flex items-center gap-2 ${styles.text}`}
    >
      <span className={`w-2 h-4 ${styles.bgSpan}`}></span> {children}
    </h3>
  );
};

export { TitleManagement };
