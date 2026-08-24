import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Settings } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LabelInput } from "@/components/ui/input";
import { BtnGoback, BtnSave } from "@/components/ui/button";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const SettingsPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const { t: tMenu } = useTranslation("translation", {
    keyPrefix: "component.menu",
  });
  const [form, setForm] = useState({ points_to_money_rate: 1000 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await loyaltyApi.getSettings();
        setForm(res?.data?.settings ?? { points_to_money_rate: 1000 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await loyaltyApi.updateSettings({
        points_to_money_rate: Number(form.points_to_money_rate),
      });
      ShowToast("success", t("save_success"));
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg space-y-4">
      <Breadcrumbs
        data={[
          { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
          { title: tMenu("membership"), route: "" },
          { title: tMenu("loyalty"), route: "/management/loyalty" },
          { title: t("settings"), route: "" },
        ]}
      />
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        <Settings size={20} className="text-sky-500" /> {t("settings")}
      </h3>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-sm">
        <LabelInput
          id="points-to-money-rate"
          type="number"
          label={t("points_to_money_rate")}
          value={form.points_to_money_rate}
          onChange={(e) =>
            setForm({ ...form, points_to_money_rate: e.target.value })
          }
        />
        <p className="mt-1 text-xs text-slate-400">
          {t("points_to_money_rate_hint")}
        </p>
        <div className="flex items-stretch gap-2">
          <BtnGoback />
          <BtnSave
            onClick={handleSave}
            loading={saving}
            loadingText={t("saving")}
          >
            {t("save")}
          </BtnSave>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
