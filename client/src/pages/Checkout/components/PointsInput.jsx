import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Coins } from "lucide-react";
import useMembership from "@/hooks/useMembership";

const PointsInput = ({ onApplyPoints, appliedDiscount, busy }) => {
  const { t } = useTranslation();
  const { membership } = useMembership();
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");

  const available = membership?.points_balance || 0;
  const rate = membership?.points_to_money_rate || 0;

  const handleApply = () => {
    const val = parseInt(points, 10);
    if (!val || val <= 0) { setError(t("loyalty.invalid_points")); return; }
    if (val > available) { setError(t("loyalty.points_exceed")); return; }
    setError("");
    onApplyPoints(val);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <Coins size={16} className="text-amber-500" />
        {t("loyalty.use_points", { available: available?.toLocaleString("vi-VN") })}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder={t("loyalty.enter_points")}
          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={busy || available <= 0}
          className="px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
        >
          {t("loyalty.apply")}
        </button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {appliedDiscount > 0 && (
        <p className="text-xs text-emerald-600">
          {t("loyalty.applied", { amount: appliedDiscount.toLocaleString("vi-VN") })}
        </p>
      )}
      {rate > 0 && (
        <p className="text-xs text-slate-400">
          {t("loyalty.rate_hint", { rate })}
        </p>
      )}
    </div>
  );
};

export default PointsInput;
