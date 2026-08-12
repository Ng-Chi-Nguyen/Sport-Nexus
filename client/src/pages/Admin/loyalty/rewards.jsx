import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { LayoutDashboard, Gift, Pencil } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LabelInput } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnGoback, BtnSave } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import { queryClient } from "@/lib/react-query";

const RewardForm = ({ initial, tiers, hiddenCoupons = [], onSave, onCancel }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [form, setForm] = useState(
    initial || {
      tier_id: tiers?.[0]?.id ?? "",
      name: "",
      point_cost: 0,
      coupon_code: "",
      is_active: true,
    },
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setNum = (k) => (e) =>
    setForm({ ...form, [k]: Number(e.target.value) });

  const formatDiscount = (c) => {
    const val = Number(c.discount_value);
    const value =
      c.discount_type === "PERCENTAGE"
        ? `${val}%`
        : `${val.toLocaleString("vi-VN")}₫`;
    return `${c.code} (${value})`;
  };
  const couponOptions = hiddenCoupons.map((c) => ({
    slug: c.code,
    name: formatDiscount(c),
  }));
  if (
    form.coupon_code &&
    !couponOptions.some((o) => o.slug === form.coupon_code)
  ) {
    couponOptions.unshift({ slug: form.coupon_code, name: form.coupon_code });
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="font-bold text-slate-900 dark:text-slate-100">
        {initial ? t("edit_reward") : t("add_reward")}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 text-sm">
        <SimpleSelect
          label={t("tier")}
          options={tiers.map((tier) => ({ slug: tier.id, name: tier.name }))}
          value={form.tier_id}
          onChange={(val) => setForm({ ...form, tier_id: val })}
          placeholder={t("select_tier")}
        />
        <LabelInput
          id="reward-name"
          label={t("reward_name")}
          value={form.name}
          onChange={set("name")}
        />
        <LabelInput
          id="reward-point-cost"
          type="number"
          label={t("point_cost")}
          value={form.point_cost}
          onChange={setNum("point_cost")}
        />
        <SimpleSelect
          label={t("coupon_code")}
          placeholder={t("select_coupon")}
          options={couponOptions}
          value={form.coupon_code}
          onChange={(val) => setForm({ ...form, coupon_code: val })}
        />
        <div className="flex items-end">
          <AnimatedCheckbox
            id="reward-is-active"
            label={t("is_active")}
            checked={!!form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <BtnSave onClick={() => onSave(form)}>{t("save")}</BtnSave>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 border rounded-lg cursor-pointer"
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
};

const RewardPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const { t: tMenu } = useTranslation("translation", {
    keyPrefix: "component.menu",
  });
  const { rewards, tiers, hiddenCoupons } = useLoaderData();
  const revalidator = useRevalidator();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  console.log(rewards, tiers);
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] });
    revalidator.revalidate();
  };

  const handleSave = async (form) => {
    try {
      if (editing) await loyaltyApi.updateReward(editing.id, form);
      else await loyaltyApi.createReward(form);
      ShowToast("success", t("save_success"));
      setShowForm(false);
      setEditing(null);
      refresh();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  const handleDelete = async () => {
    try {
      await loyaltyApi.deleteReward(confirmTarget.id);
      ShowToast("success", t("delete_success"));
      setConfirmTarget(null);
      refresh();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("delete_fail"));
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs
        data={[
          { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
          { title: tMenu("membership"), route: "" },
          { title: tMenu("loyalty"), route: "/management/loyalty" },
          { title: t("rewards"), route: "" },
        ]}
      />
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <Gift size={20} className="text-rose-500" /> {t("rewards")}
        </h3>
        <div className="flex items-stretch gap-2">
          <BtnGoback />
          <BtnSave
            onClick={() => {
              setEditing(null);
              setShowForm((v) => !v);
            }}
          >
            {t("add_reward")}
          </BtnSave>
        </div>
      </div>

      {showForm && (
        <RewardForm
          initial={editing}
          tiers={tiers}
          hiddenCoupons={hiddenCoupons ?? []}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

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
              <tr
                key={reward.id}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="p-3">{reward.tier?.name ?? reward.tier_id}</td>
                <td className="p-3 font-medium">{reward.name}</td>
                <td className="p-3">{Number(reward.point_cost)}</td>
                <td className="p-3 text-slate-500">
                  {reward.coupon ? (
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {reward.coupon.code}
                      </div>
                      <div className="text-xs text-rose-600 dark:text-rose-400">
                        {reward.coupon.discount_type === "PERCENTAGE"
                          ? `Giảm ${reward.coupon.discount_value}%`
                          : `Giảm ${Number(reward.coupon.discount_value).toLocaleString("vi-VN")}đ`}
                        {Number(reward.coupon.min_order_value) > 0 &&
                          ` · Từ ${Number(reward.coupon.min_order_value).toLocaleString("vi-VN")}đ`}
                      </div>
                    </div>
                  ) : (
                    reward.coupon_code || "—"
                  )}
                </td>
                <td className="p-3">
                  <Badge>
                    {reward.is_active ? t("active") : t("inactive")}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(reward);
                        setShowForm(true);
                      }}
                      className="flex items-center justify-center px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400 rounded-lg active:scale-95 transition-all duration-150"
                      title={t("edit")}
                    >
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

      <ConfirmDelete
        isOpen={!!confirmTarget}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default RewardPage;
