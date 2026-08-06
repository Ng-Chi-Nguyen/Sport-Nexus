import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const DescriptionTab = ({ description }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );
    }
  }, [description]);

  return (
    <div className="space-y-3">
      <div
        ref={textRef}
        className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line transition-all ${
          !expanded ? "line-clamp-4" : ""
        }`}
      >
        {description}
      </div>
      {isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-sky-600 dark:text-sky-400 bg-white dark:bg-[#111827]/60 py-1.5 px-4 border border-sky-200 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all shadow-sm cursor-pointer"
        >
          {expanded ? (
            <>
              {t("show_less")} <ChevronUp size={16} />
            </>
          ) : (
            <>
              {t("show_more")} <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ShippingTab = () => {
  const { t } = useTranslation();
  return (
    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
      <p>{t("shipping_policy_1")}</p>
      <p>{t("shipping_policy_2")}</p>
      <p>{t("shipping_policy_3")}</p>
      <p>{t("shipping_policy_4")}</p>
    </div>
  );
};

const ReturnTab = () => {
  const { t } = useTranslation();
  return (
    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
      <p>{t("return_policy_1")}</p>
      <p>{t("return_policy_2")}</p>
      <p>{t("return_policy_3")}</p>
      <p>{t("return_policy_4")}</p>
    </div>
  );
};

const ProductTabs = ({ description }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("description");

  const TABS = [
    { key: "description", label: t("tab_description") },
    { key: "shipping", label: t("tab_shipping") },
    { key: "return", label: t("tab_return") },
  ];

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 font-semibold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="py-4">
        {activeTab === "description" && (
          <DescriptionTab description={description} />
        )}
        {activeTab === "shipping" && <ShippingTab />}
        {activeTab === "return" && <ReturnTab />}
      </div>
    </div>
  );
};

export default ProductTabs;
