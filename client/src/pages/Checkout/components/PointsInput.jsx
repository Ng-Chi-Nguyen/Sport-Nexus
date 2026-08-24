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
    if (!val || val <= 0) {
      setError(t("loyalty.invalid_points"));
      return;
    }
    if (val > available) {
      setError(t("loyalty.points_exceed"));
      return;
    }
    setError("");
    onApplyPoints(val);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D121F]/40 rounded-xl p-3 sm:p-4 space-y-3 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-2 text-[13px] sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Coins size={18} className="text-amber-500 shrink-0" />
        <span>
          {t("loyalty.use_points", {
            available: available?.toLocaleString("vi-VN"),
          })}
        </span>
      </div>

      {/* TỐI ƯU MOBILE: flex-col trên điện thoại, flex-row trên PC. Tăng vùng chạm bằng py-2.5 */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
        <input
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder={t("loyalty.enter_points")}
          className="flex-1 w-full px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] sm:text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={busy || available <= 0}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-amber-500 text-white text-[13px] sm:text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
        >
          {t("loyalty.apply")}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>
      )}
      {appliedDiscount > 0 && (
        <p className="text-xs text-emerald-600 font-medium pl-1">
          {t("loyalty.applied", {
            amount: appliedDiscount.toLocaleString("vi-VN"),
          })}
        </p>
      )}
      {rate > 0 && (
        <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 pl-1 leading-relaxed">
          {t("loyalty.rate_hint", { rate })}
        </p>
      )}
    </div>
  );
};

export default PointsInput;
