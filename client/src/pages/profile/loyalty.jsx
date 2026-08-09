import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift, History } from "lucide-react";
import loyaltyApi from "@/api/customer/loyaltyApi";
import MembershipBlock from "@/components/customer/MembershipBlock";
import ShowToast from "@/components/ui/toast";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const LoyaltyPage = () => {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, tr] = await Promise.all([
          loyaltyApi.getRewards(),
          loyaltyApi.getTransactions(),
        ]);
        setRewards(r?.data?.rewards ?? []);
        setTransactions(tr?.data?.transactions ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRedeem = async (reward) => {
    setRedeeming(reward.id);
    try {
      const res = await loyaltyApi.redeemReward(reward.id);
      ShowToast("success", res?.message || t("loyalty.redeem_success"));
      window.location.reload();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("loyalty.redeem_fail"));
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <MembershipBlock />

      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          <Gift size={18} className="text-amber-500" />
          {t("loyalty.rewards")}
        </h3>
        {rewards.length === 0 ? (
          <p className="text-sm text-slate-500">{t("loyalty.no_rewards")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((r) => (
              <div key={r.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.point_cost?.toLocaleString("vi-VN")} {t("loyalty.points")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeem(r)}
                  disabled={redeeming === r.id}
                  className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                >
                  {redeeming === r.id ? t("loyalty.redeeming") : t("loyalty.redeem")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          <History size={18} className="text-sky-500" />
          {t("loyalty.history")}
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">{t("loyalty.no_history")}</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left p-3">{t("loyalty.date")}</th>
                  <th className="text-left p-3">{t("loyalty.type")}</th>
                  <th className="text-left p-3">{t("loyalty.note")}</th>
                  <th className="text-right p-3">{t("loyalty.points")}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">{new Date(tx.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-3">{tx.type}</td>
                    <td className="p-3">{tx.note || ""}</td>
                    <td className={`p-3 text-right ${tx.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points?.toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default LoyaltyPage;
