// src/components/ui/LoadingSpinner.jsx
import { useTranslation } from "react-i18next";

const LoadingSpinner = () => {
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#0D121F] transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner với màu chủ đạo #4facf3 */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-[#4facf3]"></div>
        <p className="font-bold text-slate-800 dark:text-slate-100 animate-pulse uppercase tracking-widest text-xs">
          {t("loading_sportnexus", "Đang tải...")}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
