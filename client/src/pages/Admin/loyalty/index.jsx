import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Trophy, Gift, Settings, Users } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";

const LoyaltyAdminPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const { t: tMenu } = useTranslation("translation", {
    keyPrefix: "component.menu",
  });
  const items = [
    {
      to: "/management/loyalty/tiers",
      icon: Trophy,
      label: t("tiers"),
      desc: t("tiers_desc"),
    },
    {
      to: "/management/loyalty/rewards",
      icon: Gift,
      label: t("rewards"),
      desc: t("rewards_desc"),
    },
    {
      to: "/management/loyalty/settings",
      icon: Settings,
      label: t("settings"),
      desc: t("settings_desc"),
    },
    {
      to: "/management/loyalty/users",
      icon: Users,
      label: t("users"),
      desc: t("users_desc"),
    },
  ];
  return (
    <div className="space-y-4">
      <Breadcrumbs
        data={[
          { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
          { title: tMenu("membership"), route: "" },
          { title: tMenu("loyalty"), route: "" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-sky-500 transition-colors"
            >
              <Icon size={24} className="text-sky-500 mb-2" />
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {item.label}
              </p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LoyaltyAdminPage;
