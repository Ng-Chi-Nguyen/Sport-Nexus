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
    green: {
      border: "border-green-500",
      text: "text-green-600",
      bgSpan: "bg-green-500",
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

const SectionTitle = ({ children }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl md:text-2xl font-bold text-slate-900">
        {children}
      </h3>
      <div className="mt-1.5 h-0.5 w-auto rounded-full bg-primary" />
    </div>
  );
};

const TitleWithIcon = ({ icon: Icon, title }) => {
  return (
    <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-5 h-5 text-primary" strokeWidth={3} />}
      <p className="border-b border-primary">{title}</p>
    </h2>
  );
};

export { TitleManagement, SectionTitle, TitleWithIcon };
