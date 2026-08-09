import { useTranslation } from "react-i18next";
import { Medal, Coins, TrendingUp, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import useMembership from "@/hooks/useMembership";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const MembershipBlock = () => {
  const { t } = useTranslation();
  const { membership, loading } = useMembership();

  if (loading) return <LoadingSpinner />;
  if (!membership) return null;

  const { tier, next_tier, points_balance, total_spent, progress, points_to_money_rate } = membership;
  const progressPct = Math.round((progress || 0) * 100);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Medal className="text-amber-500" size={28} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("loyalty.tier")}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {tier?.name || t("loyalty.no_tier")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Coins className="text-amber-500" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("loyalty.points")}
            </p>
            <p className="text-lg font-bold text-amber-600">
              {points_balance?.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShoppingCart className="text-sky-500" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("loyalty.total_spent")}
            </p>
            <p className="text-lg font-bold text-sky-600">
              {formatCurrency(total_spent)}
            </p>
          </div>
        </div>
      </div>

      {next_tier && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>{t("loyalty.progress_to", { tier: next_tier.name })}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {points_to_money_rate > 0 && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp size={12} className="inline mr-1" />
              {t("loyalty.rate_hint", { rate: points_to_money_rate })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipBlock;
