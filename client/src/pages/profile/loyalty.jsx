import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Gift, History } from "lucide-react";
import loyaltyApi from "@/api/customer/loyaltyApi";
import MembershipBlock from "@/components/customer/MembershipBlock";
import ShowToast from "@/components/ui/toast";
import { Confirm } from "@/components/ui/confirm";
import CouponCard from "@/components/ui/couponCard";
import { CarouselPagination } from "@/components/ui/pagination";
import { TitleWithIcon } from "@/components/ui/title";

const ITEMS_PER_PAGE = 4;
const TX_PER_PAGE = 10;

const LoyaltyPage = () => {
  const { t } = useTranslation();
  const { rewards, transactions = [] } = useLoaderData();
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  const [redeeming, setRedeeming] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [txCurrentIndex, setTxCurrentIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE));
  const pageRewards = rewards.slice(
    currentIndex * ITEMS_PER_PAGE,
    (currentIndex + 1) * ITEMS_PER_PAGE,
  );

  const txTotalPages = Math.max(
    1,
    Math.ceil(transactions.length / TX_PER_PAGE),
  );
  const txPage = transactions.slice(
    txCurrentIndex * TX_PER_PAGE,
    (txCurrentIndex + 1) * TX_PER_PAGE,
  );

  const handleRedeem = async () => {
    if (!confirmTarget) return;
    setRedeeming(confirmTarget.id);
    try {
      const res = await loyaltyApi.redeemReward(confirmTarget.id);
      ShowToast("success", res?.message || t("loyalty.redeem_success"));
      revalidator.revalidate();
      setRefreshKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ["gifted-coupons"] });
      const redeemedCode = res?.data?.data?.coupon?.code;
      if (redeemedCode) {
        try {
          const dismissed = JSON.parse(
            localStorage.getItem("dismissed-gifted-coupons") || "[]",
          );
          if (Array.isArray(dismissed) && dismissed.includes(redeemedCode)) {
            localStorage.setItem(
              "dismissed-gifted-coupons",
              JSON.stringify(dismissed.filter((c) => c !== redeemedCode)),
            );
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      ShowToast(
        "error",
        err?.response?.data?.message || t("loyalty.redeem_fail"),
      );
    } finally {
      setRedeeming(null);
      setConfirmTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <MembershipBlock refreshKey={refreshKey} />

      <section>
        <TitleWithIcon icon={Gift} title={t("loyalty.rewards")} />
        {rewards.length === 0 ? (
          <p className="text-sm text-slate-500">{t("loyalty.no_rewards")}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {pageRewards.map((r) => (
                <div
                  key={r.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.point_cost?.toLocaleString("vi-VN")}{" "}
                        {t("loyalty.points")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(r)}
                      disabled={redeeming === r.id}
                      className="shrink-0 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primaryHover disabled:opacity-50 cursor-pointer"
                    >
                      {redeeming === r.id
                        ? t("loyalty.redeeming")
                        : t("loyalty.redeem")}
                    </button>
                  </div>
                  {r.coupon ? (
                    <CouponCard
                      coupon={r.coupon}
                      showPrint={false}
                      locked={!r.redeemed}
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <CarouselPagination
              className="mt-5"
              totalPages={totalPages}
              current={currentIndex}
              onChange={setCurrentIndex}
            />
          </>
        )}
      </section>

      <section>
        <TitleWithIcon icon={History} title={t("loyalty.history")} />
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">{t("loyalty.no_history")}</p>
        ) : (
          <div className="space-y-4">
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
                  {txPage.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="p-3">
                        {new Date(tx.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3">{tx.type}</td>
                      <td className="p-3">{tx.note || ""}</td>
                      <td
                        className={`p-3 text-right ${tx.points > 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {tx.points > 0 ? "+" : ""}
                        {tx.points?.toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CarouselPagination
              totalPages={txTotalPages}
              current={txCurrentIndex}
              onChange={setTxCurrentIndex}
            />
          </div>
        )}
      </section>

      <Confirm
        isOpen={!!confirmTarget}
        type="info"
        title={t("loyalty.confirm_redeem_title")}
        message={t("loyalty.confirm_redeem_message", {
          points: confirmTarget?.point_cost?.toLocaleString("vi-VN"),
          name: confirmTarget?.name,
        })}
        onConfirm={handleRedeem}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default LoyaltyPage;
