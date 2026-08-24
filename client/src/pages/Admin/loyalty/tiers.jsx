import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Trophy, Pencil } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LabelInput } from "@/components/ui/input";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnGoback, BtnSave } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import { formatCurrency } from "@/utils/formatters";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const TierForm = ({ initial, onSave, onCancel }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [form, setForm] = useState(
    initial || {
      name: "",
      min_spent: 0,
      reward_rate: 0,
      discount_percent: 0,
      sort_order: 0,
      is_active: true,
    },
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setNum = (k) => (e) =>
    setForm({ ...form, [k]: Number(e.target.value) });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 bg-white dark:bg-[#0D121F]/40 shadow-sm">
      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
        {initial ? t("edit_tier") : t("add_tier")}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
        <LabelInput
          id="tier-name"
          label={t("tier_name")}
          value={form.name}
          onChange={set("name")}
        />
        <LabelInput
          id="tier-min-spent"
          type="number"
          label={t("min_spent")}
          value={form.min_spent}
          onChange={setNum("min_spent")}
        />
        <LabelInput
          id="tier-reward-rate"
          type="number"
          step="0.01"
          label={t("reward_rate")}
          value={form.reward_rate}
          onChange={setNum("reward_rate")}
        />
        <LabelInput
          id="tier-discount"
          type="number"
          label={t("discount_percent")}
          value={form.discount_percent}
          onChange={setNum("discount_percent")}
        />
        <LabelInput
          id="tier-sort-order"
          type="number"
          label={t("sort_order")}
          value={form.sort_order}
          onChange={setNum("sort_order")}
        />
        <div className="flex items-center pt-1">
          <AnimatedCheckbox
            id="tier-is-active"
            label={t("is_active")}
            checked={!!form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
        </div>
      </div>

      {/* TỐI ƯU MOBILE: Nút lưu/hủy dàn đều, dễ bấm trên di động */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
        <BtnSave onClick={() => onSave(form)} className="w-full sm:w-auto">
          {t("save")}
        </BtnSave>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
};

const TierPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const { t: tMenu } = useTranslation("translation", {
    keyPrefix: "component.menu",
  });
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await loyaltyApi.getTiers();
      setTiers(res?.data?.tiers ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleSave = async (form) => {
    try {
      if (editing) await loyaltyApi.updateTier(editing.id, form);
      else await loyaltyApi.createTier(form);
      ShowToast("success", t("save_success"));
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  const handleDelete = async () => {
    try {
      await loyaltyApi.deleteTier(confirmTarget.id);
      ShowToast("success", t("delete_success"));
      setConfirmTarget(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("delete_fail"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs
        data={[
          { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
          { title: tMenu("membership"), route: "" },
          { title: tMenu("loyalty"), route: "/management/loyalty" },
          { title: t("tiers"), route: "" },
        ]}
      />

      {/* TỐI ƯU MOBILE: Xếp dọc tiêu đề và cụm nút điều hướng khi màn hình hẹp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <Trophy size={20} className="text-primary shrink-0" /> {t("tiers")}
        </h3>
        <div className="flex items-center gap-2">
          <BtnGoback />
          <BtnSave
            onClick={() => {
              setEditing(null);
              setShowForm((v) => !v);
            }}
          >
            {t("add_tier")}
          </BtnSave>
        </div>
      </div>

      {showForm && (
        <TierForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {/* BẢNG DANH SÁCH: Thêm overflow-x-auto để cuộn mượt mà trên mobile */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0D121F]/40 shadow-sm">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
            <tr>
              <th className="text-left p-3.5 font-semibold">
                {t("tier_name")}
              </th>
              <th className="text-left p-3.5 font-semibold">
                {t("min_spent")}
              </th>
              <th className="text-left p-3.5 font-semibold">
                {t("reward_rate")}
              </th>
              <th className="text-left p-3.5 font-semibold">
                {t("discount_percent")}
              </th>
              <th className="text-left p-3.5 font-semibold">
                {t("sort_order")}
              </th>
              <th className="text-left p-3.5 font-semibold">
                {t("is_active")}
              </th>
              <th className="text-right p-3.5 font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {tiers.length > 0 ? (
              tiers.map((tier) => (
                <tr
                  key={tier.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">
                    {tier.name}
                  </td>
                  <td className="p-3.5 font-mono">
                    {formatCurrency(tier.min_spent)}
                  </td>
                  <td className="p-3.5 font-mono">
                    {Number(tier.reward_rate)}
                  </td>
                  <td className="p-3.5 font-mono">{tier.discount_percent}%</td>
                  <td className="p-3.5 font-mono">{tier.sort_order}</td>
                  <td className="p-3.5">
                    <Badge color={tier.is_active ? "green" : "gray"}>
                      {tier.is_active ? t("active") : t("inactive")}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(tier);
                          setShowForm(true);
                        }}
                        className="flex items-center justify-center p-2 bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer"
                        title={t("edit")}
                      >
                        <Pencil size={14} />
                      </button>
                      <BtnDelete onClick={() => setConfirmTarget(tier)} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-8 text-center text-slate-400 italic"
                >
                  {t("no_tiers", "Chưa có hạng thành viên nào")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDelete
        isOpen={!!confirmTarget}
        title={t("delete_title", "Xác nhận xóa")}
        message={t("delete_message", { name: confirmTarget?.name })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default TierPage;
