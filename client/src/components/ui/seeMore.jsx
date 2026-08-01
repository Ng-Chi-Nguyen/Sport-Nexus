import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SeeMore = ({ onClick, to, label }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <div className="flex justify-center pt-6">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-white dark:bg-[#0D121F]/40 border border-sky-200 dark:border-sky-500/30 hover:border-sky-300 dark:hover:border-sky-500/50 rounded-xl px-5 py-2.5 transition-all duration-200 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
      >
        {label ?? t("see_more")}
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default SeeMore;
