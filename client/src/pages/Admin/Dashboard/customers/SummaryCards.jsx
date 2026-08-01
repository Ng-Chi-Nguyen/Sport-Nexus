import { Users, UserCheck, UserX, ShoppingBag, Repeat } from "lucide-react";
import { KpiCard } from "@/pages/Admin/Dashboard/components/KpiCard";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { useTranslation } from "react-i18next";

const KPI_TONES = {
  blue: "from-blue-500/10 border-blue-200 dark:from-blue-600/30 dark:border-blue-900/40",
  emerald:
    "from-emerald-500/10 border-emerald-200 dark:from-emerald-600/30 dark:border-emerald-900/40",
  amber:
    "from-amber-500/10 border-amber-200 dark:from-amber-600/30 dark:border-amber-900/40",
  violet:
    "from-violet-500/10 border-violet-200 dark:from-violet-600/30 dark:border-violet-900/40",
  rose: "from-rose-500/10 border-rose-200 dark:from-rose-600/30 dark:border-rose-900/40",
};

export const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const {
    totalUsers = 0,
    verifiedUsers = 0,
    unverifiedUsers = 0,
    activeUsers = 0,
    blockedUsers = 0,
    usersWithOrders = 0,
    repeatPurchaseRate = 0,
    repeatBuyers = 0,
    oneTimeBuyers = 0,
  } = summary;

  const totalVerification = verifiedUsers + unverifiedUsers;

  return (
    <div className="space-y-4">
      {/* Hàng KPI chính */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-start">
        <KpiCard
          label={t("total_users")}
          value={totalUsers.toLocaleString()}
          icon={<Users size={16} />}
          tone={KPI_TONES.blue}
        />
        <KpiCard
          label={t("users_with_orders")}
          value={usersWithOrders.toLocaleString()}
          icon={<ShoppingBag size={16} />}
          tone={KPI_TONES.emerald}
        />
        <KpiCard
          label={t("repeat_purchase_rate")}
          value={`${repeatPurchaseRate}%`}
          icon={<Repeat size={16} />}
          tone={KPI_TONES.violet}
        />
        <KpiCard
          label={t("blocked_users")}
          value={blockedUsers.toLocaleString()}
          icon={<UserX size={16} />}
          tone={KPI_TONES.rose}
        />
      </div>

      {/* Hàng các thẻ phân tích tỷ lệ (Xác thực, Trạng thái, Phân khúc) */}
      <div className="grid gap-4 sm:grid-cols-3 items-start">
        <Card title={t("verification_title")} icon={<UserCheck size={16} />}>
          <div className="space-y-3 py-1">
            <ProgressBar
              label={t("verified")}
              count={verifiedUsers}
              color="from-emerald-500 to-teal-400"
              percent={
                totalVerification
                  ? (verifiedUsers / totalVerification) * 100
                  : 0
              }
            />
            <ProgressBar
              label={t("unverified")}
              count={unverifiedUsers}
              color="from-amber-500 to-orange-400"
              percent={
                totalVerification
                  ? (unverifiedUsers / totalVerification) * 100
                  : 0
              }
            />
          </div>
        </Card>

        <Card title={t("status_title")} icon={<UserX size={16} />}>
          <div className="space-y-3 py-1">
            <ProgressBar
              label={t("active_users")}
              count={activeUsers}
              color="from-emerald-500 to-teal-400"
              percent={totalUsers ? (activeUsers / totalUsers) * 100 : 0}
            />
            <ProgressBar
              label={t("blocked")}
              count={blockedUsers}
              color="from-rose-500 to-red-400"
              percent={totalUsers ? (blockedUsers / totalUsers) * 100 : 0}
            />
          </div>
        </Card>

        <Card title={t("purchase_segment")} icon={<ShoppingBag size={16} />}>
          <div className="space-y-3 py-1">
            <ProgressBar
              label={t("one_time_buyers")}
              count={oneTimeBuyers}
              color="from-blue-500 to-cyan-400"
              percent={
                usersWithOrders ? (oneTimeBuyers / usersWithOrders) * 100 : 0
              }
            />
            <ProgressBar
              label={t("repeat_buyers")}
              count={repeatBuyers}
              color="from-violet-500 to-purple-400"
              percent={
                usersWithOrders ? (repeatBuyers / usersWithOrders) * 100 : 0
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
