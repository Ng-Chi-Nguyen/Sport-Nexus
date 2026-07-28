import { Users, UserCheck, UserX, ShoppingBag, Repeat } from "lucide-react";
import { KpiCard } from "@/pages/Admin/Dashboard/components/KpiCard";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";

const KPI_TONES = {
  blue: "from-blue-600/30 border-blue-900/40",
  emerald: "from-emerald-600/30 border-emerald-900/40",
  amber: "from-amber-600/30 border-amber-900/40",
  violet: "from-violet-600/30 border-violet-900/40",
  rose: "from-rose-600/30 border-rose-900/40",
};

export const SummaryCards = ({ summary = {} }) => {
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-start">
        <KpiCard
          label="Tổng người dùng"
          value={totalUsers.toLocaleString()}
          icon={<Users size={16} />}
          tone={KPI_TONES.blue}
        />
        <KpiCard
          label="User có đơn hàng"
          value={usersWithOrders.toLocaleString()}
          icon={<ShoppingBag size={16} />}
          tone={KPI_TONES.emerald}
        />
        <KpiCard
          label="Tỉ lệ quay lại"
          value={`${repeatPurchaseRate}%`}
          icon={<Repeat size={16} />}
          tone={KPI_TONES.violet}
        />
        <KpiCard
          label="User bị khóa"
          value={blockedUsers.toLocaleString()}
          icon={<UserX size={16} />}
          tone={KPI_TONES.rose}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 items-start">
        <Card title="Xác thực" icon={<UserCheck size={16} />}>
          <div className="space-y-3 py-1">
            <ProgressBar
              label="Đã xác thực"
              count={verifiedUsers}
              color="from-emerald-500 to-teal-400"
              percent={totalVerification ? (verifiedUsers / totalVerification) * 100 : 0}
            />
            <ProgressBar
              label="Chưa xác thực"
              count={unverifiedUsers}
              color="from-amber-500 to-orange-400"
              percent={totalVerification ? (unverifiedUsers / totalVerification) * 100 : 0}
            />
          </div>
        </Card>

        <Card title="Trạng thái" icon={<UserX size={16} />}>
          <div className="space-y-3 py-1">
            <ProgressBar
              label="Đang hoạt động"
              count={activeUsers}
              color="from-emerald-500 to-teal-400"
              percent={totalUsers ? (activeUsers / totalUsers) * 100 : 0}
            />
            <ProgressBar
              label="Bị khóa"
              count={blockedUsers}
              color="from-rose-500 to-red-400"
              percent={totalUsers ? (blockedUsers / totalUsers) * 100 : 0}
            />
          </div>
        </Card>

        <Card title="Phân khúc mua hàng" icon={<ShoppingBag size={16} />}>
          <div className="space-y-3 py-1">
            <ProgressBar
              label="Khách mua 1 lần"
              count={oneTimeBuyers}
              color="from-blue-500 to-cyan-400"
              percent={usersWithOrders ? (oneTimeBuyers / usersWithOrders) * 100 : 0}
            />
            <ProgressBar
              label="Khách quay lại"
              count={repeatBuyers}
              color="from-violet-500 to-purple-400"
              percent={usersWithOrders ? (repeatBuyers / usersWithOrders) * 100 : 0}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
