import { useTranslation } from "react-i18next";
import { Medal, Coins, TrendingUp, ShoppingCart, Sparkles } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import useMembership from "@/hooks/useMembership";
import LoadingSpinner from "@/components/ui/loadingSpinner";

// Bảng cấu hình giao diện theo từng Hạng
const TIER_THEMES = {
  bronze: {
    cardBg:
      "bg-gradient-to-br from-amber-900/10 via-amber-800/5 to-amber-700/10 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900",
    border: "border-amber-700/30 dark:border-amber-700/40",
    badgeBg:
      "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200",
    accentText: "text-amber-800 dark:text-amber-300",
    iconColor: "text-amber-700 dark:text-amber-400",
    progressBar: "bg-gradient-to-r from-amber-700 to-amber-500",
  },
  gold: {
    cardBg:
      "bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-amber-100/30 dark:from-yellow-950/40 dark:via-stone-900 dark:to-yellow-950/30",
    border: "border-yellow-500/40 dark:border-yellow-500/50",
    badgeBg:
      "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200",
    accentText: "text-yellow-700 dark:text-yellow-300",
    iconColor: "text-yellow-500 dark:text-yellow-400",
    progressBar: "bg-gradient-to-r from-yellow-500 to-amber-400 shadow-sm",
  },
  diamond: {
    cardBg:
      "bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-indigo-500/15 dark:from-cyan-950/50 dark:via-slate-900 dark:to-indigo-950/50",
    border:
      "border-cyan-400/50 dark:border-cyan-500/40 shadow-sm shadow-cyan-500/10",
    badgeBg: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/50 dark:text-cyan-200",
    accentText: "text-cyan-700 dark:text-cyan-300",
    iconColor: "text-cyan-500 dark:text-cyan-400",
    progressBar:
      "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-sm",
  },
  default: {
    cardBg:
      "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900",
    border: "border-slate-200 dark:border-slate-800",
    badgeBg:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    accentText: "text-slate-700 dark:text-slate-300",
    iconColor: "text-slate-600 dark:text-slate-400",
    progressBar: "bg-slate-700 dark:bg-slate-400",
  },
};

// Hàm nhận diện key thứ hạng từ tên hoặc code của hạng
const getTierKey = (tier) => {
  const code = (tier?.code || tier?.name || "").toLowerCase();
  if (
    code.includes("diamond") ||
    code.includes("kim cuong") ||
    code.includes("kim cương")
  )
    return "diamond";
  if (code.includes("gold") || code.includes("vang") || code.includes("vàng"))
    return "gold";
  if (code.includes("bronze") || code.includes("dong") || code.includes("đồng"))
    return "bronze";
  return "default";
};

const MembershipBlock = ({ refreshKey }) => {
  const { t } = useTranslation();
  const { membership, loading } = useMembership(refreshKey);

  if (loading) return <LoadingSpinner />;
  if (!membership) return null;

  const {
    tier,
    next_tier,
    points_balance,
    total_spent,
    progress,
    points_to_money_rate,
  } = membership;

  const progressPct = Math.round((progress || 0) * 100);
  const tierKey = getTierKey(tier);
  const theme = TIER_THEMES[tierKey] || TIER_THEMES.default;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 backdrop-blur-sm ${theme.cardBg} ${theme.border}`}
    >
      {/* Thẻ hiển thị hạng & Điểm */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Tier Name */}
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm ${theme.badgeBg}`}
          >
            {tierKey === "diamond" ? (
              <Sparkles className={theme.iconColor} size={26} />
            ) : (
              <Medal className={theme.iconColor} size={26} />
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              {t("loyalty.tier")}
            </p>
            <p
              className={`text-xl font-black tracking-tight ${theme.accentText}`}
            >
              {tier?.name || t("loyalty.no_tier")}
            </p>
          </div>
        </div>

        {/* Điểm tích lũy */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
            <Coins className="text-amber-500" size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("loyalty.points")}
            </p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {points_balance?.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Tổng chi tiêu */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
            <ShoppingCart className="text-emerald-500" size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("loyalty.total_spent")}
            </p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(total_spent)}
            </p>
          </div>
        </div>
      </div>

      {/* Tiến trình nâng hạng */}
      {next_tier && (
        <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            <span>{t("loyalty.progress_to", { tier: next_tier.name })}</span>
            <span className="font-bold">{progressPct}%</span>
          </div>

          <div className="h-2.5 w-full bg-slate-200/70 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${theme.progressBar}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {points_to_money_rate > 0 && (
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp size={13} className={theme.iconColor} />
              {t("loyalty.rate_hint", { rate: points_to_money_rate })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipBlock;
