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
