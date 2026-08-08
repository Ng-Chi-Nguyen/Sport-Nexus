import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

const safeInt = (val) => { const n = parseInt(val); return isNaN(n) ? undefined : n; };

const money = (v) => Number(v);

// Xác định hạng theo total_spent: hạng cao nhất có min_spent <= total_spent
const resolveTier = (tiers, totalSpent) => {
  const active = tiers
    .filter((t) => t.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
  let current = null;
  for (const t of active) {
    if (money(t.min_spent) <= totalSpent) current = t;
  }
  return current;
};

const loyaltyService = {
  getSettings: async () => {
    const rows = await prisma.loyaltySettings.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },

  // Lấy hạng/điểm/tổng chi + tiến độ lên hạng kế tiếp
  getUserMembership: async (userId) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { points_balance: true, total_spent: true },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });

    const tiers = await prisma.membershipTiers.findMany({
      orderBy: { sort_order: "asc" },
    });
    const current = resolveTier(tiers, money(user.total_spent));
    const activeTiers = tiers.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
    const nextTier = current
      ? activeTiers.find((t) => t.sort_order > current.sort_order) || null
      : activeTiers[0] || null;

    let progress = 0;
    if (current && nextTier) {
      const span = money(nextTier.min_spent) - money(current.min_spent);
      if (span > 0) {
        progress = Math.min(1, Math.max(0, (money(user.total_spent) - money(current.min_spent)) / span));
      }
    }

    const settings = await loyaltyService.getSettings();
    const pointsToMoney = parseInt(settings.points_to_money_rate, 10) || 0;

    return {
      tier: current
        ? { id: current.id, name: current.name, discount_percent: current.discount_percent, sort_order: current.sort_order }
        : null,
      next_tier: nextTier
        ? { id: nextTier.id, name: nextTier.name, min_spent: money(nextTier.min_spent) }
        : null,
      points_balance: user.points_balance,
      total_spent: money(user.total_spent),
      progress,
      points_to_money_rate: pointsToMoney,
    };
  },

  // Danh sách quà đổi được theo hạng hiện tại
  getTierRewards: async (userId) => {
    const membership = await loyaltyService.getUserMembership(userId);
    if (!membership.tier) return { rewards: [] };
    const rewards = await prisma.tierRewards.findMany({
      where: { tier_id: membership.tier.id, is_active: true, deleted_at: ACTIVE },
      select: { id: true, name: true, point_cost: true, coupon_code: true },
      orderBy: { id: "asc" },
    });
    return { rewards };
  },

  // Đổi quà: trừ điểm + cấp coupon cho user
  redeemReward: async (userId, rewardId) => {
    const reward = await prisma.tierRewards.findFirst({
      where: { id: safeInt(rewardId), is_active: true, deleted_at: ACTIVE },
      include: { tier: true },
    });
    if (!reward) throw Object.assign(new Error("Quà không tồn tại"), { status: 400 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { points_balance: true, tier_id: true },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
    if (user.tier_id !== reward.tier_id) {
      throw Object.assign(new Error("Hạng của bạn không đủ điều kiện đổi quà này"), { status: 400 });
    }
    if (user.points_balance < reward.point_cost) {
      throw Object.assign(new Error("Điểm không đủ để đổi quà"), { status: 400 });
    }

    return prisma.$transaction(async (tx) => {
      const locked = await tx.users.findUnique({
        where: { id: userId },
        select: { points_balance: true },
      });
      if (locked.points_balance < reward.point_cost) {
        throw Object.assign(new Error("Điểm không đủ để đổi quà"), { status: 400 });
      }

      const newBalance = locked.points_balance - reward.point_cost;
      await tx.users.update({
        where: { id: userId },
        data: { points_balance: newBalance },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: userId,
          type: "REDEEM",
          points: -reward.point_cost,
          balance_after: newBalance,
          note: `Đổi quà: ${reward.name}`,
        },
      });

      let coupon = null;
      if (reward.coupon_code) {
        coupon = await tx.coupons.findFirst({
          where: { code: reward.coupon_code, deleted_at: ACTIVE },
        });
        if (coupon) {
          await tx.userCoupons.upsert({
            where: { user_id_coupon_id: { user_id: userId, coupon_id: coupon.id } },
            create: { user_id: userId, coupon_id: coupon.id, used_count: 0, is_gift: true },
            update: {},
          });
        }
      }

      return { reward, coupon: coupon ? { code: coupon.code } : null };
    });
  },

  // Lịch sử điểm
  getTransactions: async (userId) => {
    const list = await prisma.pointTransactions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50,
      select: { id: true, type: true, points: true, balance_after: true, note: true, created_at: true },
    });
    return { transactions: list };
  },

  // Dùng điểm quy đổi tiền: trừ điểm, trả số tiền giảm
  applyPoints: async (userId, points) => {
    const pointsUsed = safeInt(points);
    if (!pointsUsed || pointsUsed <= 0) {
      throw Object.assign(new Error("Số điểm không hợp lệ"), { status: 400 });
    }

    const settings = await loyaltyService.getSettings();
    const rate = parseInt(settings.points_to_money_rate, 10) || 0;
    if (rate <= 0) throw Object.assign(new Error("Chưa cấu hình tỷ lệ quy đổi điểm"), { status: 400 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { points_balance: true },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
    if (user.points_balance < pointsUsed) {
      throw Object.assign(new Error("Số điểm vượt quá điểm hiện có"), { status: 400 });
    }

    const discount = pointsUsed * rate;

    return prisma.$transaction(async (tx) => {
      const newBalance = user.points_balance - pointsUsed;
      await tx.users.update({
        where: { id: userId },
        data: { points_balance: newBalance },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: userId,
          type: "SPEND",
          points: -pointsUsed,
          balance_after: newBalance,
          note: `Quy đổi thành tiền: ${discount.toLocaleString("vi-VN")} đ`,
        },
      });
      return { discount, points_used: pointsUsed, new_balance: newBalance };
    });
  },

  // Tích điểm khi đơn Delivered (gọi từ order.service.js)
  awardPoints: async (orderId) => {
    const order = await prisma.orders.findUnique({
      where: { id: safeInt(orderId) },
      select: { id: true, usersId: true, final_amount: true },
    });
    if (!order || !order.usersId) return;

    const already = await prisma.pointTransactions.findFirst({
      where: { order_id: order.id, type: "EARN" },
    });
    if (already) return;

    const user = await prisma.users.findUnique({
      where: { id: order.usersId },
      select: { tier_id: true },
    });
    if (!user) return;

    const tiers = await prisma.membershipTiers.findMany({
      orderBy: { sort_order: "asc" },
    });
    const currentTier = tiers.find((t) => t.id === user.tier_id)
      || resolveTier(tiers, money(order.final_amount));

    const rate = currentTier ? money(currentTier.reward_rate) : 0;
    const points = Math.floor(money(order.final_amount) * rate);

    return prisma.$transaction(async (tx) => {
      const locked = await tx.users.findUnique({ where: { id: order.usersId }, select: { points_balance: true, total_spent: true } });
      const newBalance = locked.points_balance + points;
      const newTotal = Number(locked.total_spent) + Number(order.final_amount);

      await tx.users.update({
        where: { id: order.usersId },
        data: { points_balance: newBalance, total_spent: newTotal },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: order.usersId,
          type: "EARN",
          points,
          balance_after: newBalance,
          order_id: order.id,
          note: points > 0 ? `Tích điểm đơn hàng #${order.id}` : null,
        },
      });

      // Cập nhật hạng theo total_spent mới
      const allTiers = await tx.membershipTiers.findMany({ orderBy: { sort_order: "asc" } });
      const newTier = resolveTier(allTiers, newTotal);
      if (newTier) {
        await tx.users.update({ where: { id: order.usersId }, data: { tier_id: newTier.id } });
      }
      return { points };
    });
  },
};

export default loyaltyService;
