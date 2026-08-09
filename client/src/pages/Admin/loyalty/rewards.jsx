import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift, Pencil } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import Badge from "@/components/ui/badge";
import { BtnDelete } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const RewardForm = ({ initial, tiers, onSave, onCancel }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [form, setForm] = useState(
    initial || { tier_id: tiers?.[0]?.id ?? "", name: "", point_cost: 0, coupon_code: "", is_active: true },
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setNum = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="font-bold text-slate-900 dark:text-slate-100">
        {initial ? t("edit_reward") : t("add_reward")}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">{t("tier")}</span>
          <select value={form.tier_id} onChange={set("tier_id")} className="w-full px-3 py-2 border rounded-lg">
            <option value="">{t("select_tier")}</option>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>{tier.name}</option>
            ))}
          </select>
        </label>
        <input value={form.name} onChange={set("name")} placeholder={t("reward_name")} className="px-3 py-2 border rounded-lg" />
        <input type="number" value={form.point_cost} onChange={setNum("point_cost")} placeholder={t("point_cost")} className="px-3 py-2 border rounded-lg" />
        <input value={form.coupon_code} onChange={set("coupon_code")} placeholder={t("coupon_code")} className="px-3 py-2 border rounded-lg" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          {t("is_active")}
        </label>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(form)} className="px-3 py-2 bg-sky-600 text-white rounded-lg cursor-pointer">{t("save")}</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-3 py-2 border rounded-lg cursor-pointer">{t("cancel")}</button>}
      </div>
    </div>
  );
};

const RewardPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [rewards, setRewards] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [res, tierRes] = await Promise.all([loyaltyApi.getRewards(), loyaltyApi.getTiers()]);
      setRewards(res?.data?.rewards ?? []);
      setTiers(tierRes?.data?.tiers ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (editing) await loyaltyApi.updateReward(editing.id, form);
      else await loyaltyApi.createReward(form);
      ShowToast("success", t("save_success"));
      setShowForm(false); setEditing(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  const handleDelete = async () => {
    try {
      await loyaltyApi.deleteReward(confirmTarget.id);
      ShowToast("success", t("delete_success"));
      setConfirmTarget(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("delete_fail"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <Gift size={20} className="text-rose-500" /> {t("rewards")}
        </h3>
        <button type="button" onClick={() => { setEditing(null); setShowForm((v) => !v); }} className="px-3 py-2 bg-sky-600 text-white text-sm rounded-lg cursor-pointer">
          {t("add_reward")}
        </button>
      </div>

      {showForm && <RewardForm initial={editing} tiers={tiers} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3">{t("tier")}</th>
              <th className="text-left p-3">{t("reward_name")}</th>
              <th className="text-left p-3">{t("point_cost")}</th>
              <th className="text-left p-3">{t("coupon_code")}</th>
              <th className="text-left p-3">{t("is_active")}</th>
              <th className="text-right p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward) => (
              <tr key={reward.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3">{reward.tier?.name ?? reward.tier_id}</td>
                <td className="p-3 font-medium">{reward.name}</td>
                <td className="p-3">{Number(reward.point_cost)}</td>
                <td className="p-3 text-slate-500">{reward.coupon_code || "—"}</td>
                <td className="p-3"><Badge>{reward.is_active ? t("active") : t("inactive")}</Badge></td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setEditing(reward); setShowForm(true); }} className="flex items-center justify-center px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400 rounded-lg active:scale-95 transition-all duration-150" title={t("edit")}>
                      <Pencil size={14} />
                    </button>
                    <BtnDelete onClick={() => setConfirmTarget(reward)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDelete isOpen={!!confirmTarget} onConfirm={handleDelete} onCancel={() => setConfirmTarget(null)} />
    </div>
  );
};

export default RewardPage;
