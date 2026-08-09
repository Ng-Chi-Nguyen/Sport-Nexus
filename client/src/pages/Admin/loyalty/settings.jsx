import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const SettingsPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
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
      await loyaltyApi.updateSettings({ points_to_money_rate: Number(form.points_to_money_rate) });
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
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        <Settings size={20} className="text-sky-500" /> {t("settings")}
      </h3>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">{t("points_to_money_rate")}</span>
          <input type="number" value={form.points_to_money_rate} onChange={(e) => setForm({ ...form, points_to_money_rate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          <p className="mt-1 text-xs text-slate-400">{t("points_to_money_rate_hint")}</p>
        </label>
        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-lg cursor-pointer disabled:opacity-50">
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
