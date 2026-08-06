import { useTranslation } from "react-i18next";

const ProfilePlaceholder = () => {
  const { t } = useTranslation("translation", { keyPrefix: "pagePlaceholder" });

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <span className="text-slate-400 text-2xl font-bold">...</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {t("feature_under_development")}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("feature_coming_soon")}
      </p>
    </div>
  );
};

export default ProfilePlaceholder;
