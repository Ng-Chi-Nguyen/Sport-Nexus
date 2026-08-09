import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

const safeInt = (val) => { const n = parseInt(val); return isNaN(n) ? undefined : n; };
const money = (v) => Number(v);

const loyaltyManagementService = {
  // ---------- MembershipTiers ----------
  createTier: async (data) => {
    return prisma.membershipTiers.create({
      data: {
        name: data.name,
        min_spent: data.min_spent,
        reward_rate: data.reward_rate,
        discount_percent: data.discount_percent ?? 0,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      },
    });
  },

  getAllTiers: async () => {
    return prisma.membershipTiers.findMany({
      orderBy: { sort_order: "asc" },
    });
  },

  updateTier: async (tierId, data) => {
    const id = safeInt(tierId);
    return prisma.membershipTiers.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.min_spent !== undefined && { min_spent: data.min_spent }),
        ...(data.reward_rate !== undefined && { reward_rate: data.reward_rate }),
        ...(data.discount_percent !== undefined && { discount_percent: data.discount_percent }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
  },

  deleteTier: async (tierId) => {
    const id = safeInt(tierId);
    return prisma.membershipTiers.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },

  // ---------- TierRewards ----------
  createReward: async (data) => {
    return prisma.tierRewards.create({
      data: {
        tier_id: data.tier_id,
        name: data.name,
        point_cost: data.point_cost,
        coupon_code: data.coupon_code ?? null,
        is_active: data.is_active ?? true,
      },
    });
  },

  getAllRewards: async () => {
    return prisma.tierRewards.findMany({
      where: { deleted_at: ACTIVE },
      include: { tier: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    });
  },

  updateReward: async (rewardId, data) => {
    const id = safeInt(rewardId);
    return prisma.tierRewards.update({
      where: { id },
      data: {
        ...(data.tier_id !== undefined && { tier_id: data.tier_id }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.point_cost !== undefined && { point_cost: data.point_cost }),
        ...(data.coupon_code !== undefined && { coupon_code: data.coupon_code }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
  },

  deleteReward: async (rewardId) => {
    const id = safeInt(rewardId);
    return prisma.tierRewards.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },

  // ---------- LoyaltySettings ----------
  updateSettings: async (data) => {
    // Chỉ cập nhật key có sẵn; thêm key mới nếu chưa có
    for (const [key, value] of Object.entries(data)) {
      await prisma.loyaltySettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    const rows = await prisma.loyaltySettings.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },

  getSettings: async () => {
    const rows = await prisma.loyaltySettings.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },

  // ---------- Users & transactions ----------
  getUsers: async ({ page = 1, search = "" } = {}) => {
    const limit = 10;
    const currentPage = Math.max(1, page || 1);
    const skip = (currentPage - 1) * limit;
    const where = { deleted_at: ACTIVE };
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { full_name: { contains: search } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true, email: true, full_name: true, phone_number: true,
          points_balance: true, total_spent: true,
          tier: { select: { id: true, name: true, sort_order: true } },
          status: true,
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.users.count({ where }),
    ]);
    return { users, total, page: currentPage, limit };
  },

  getUserDetail: async (userId) => {
    const id = safeInt(userId);
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true, email: true, full_name: true, phone_number: true,
        points_balance: true, total_spent: true, created_at: true,
        tier: { select: { id: true, name: true, sort_order: true } },
      },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
    const transactions = await prisma.pointTransactions.findMany({
      where: { user_id: id },
      orderBy: { created_at: "desc" },
      take: 100,
      select: { id: true, type: true, points: true, balance_after: true, note: true, created_at: true, order_id: true },
    });
    return { user, transactions };
  },

  adjustPoints: async (userId, points, note) => {
    const id = safeInt(userId);
    const delta = safeInt(points);
    if (!delta) throw Object.assign(new Error("Số điểm không hợp lệ"), { status: 400 });

    return prisma.$transaction(async (tx) => {
      const user = await tx.users.findUnique({ where: { id }, select: { points_balance: true } });
      if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
      const newBalance = user.points_balance + delta;
      if (newBalance < 0) throw Object.assign(new Error("Kết quả không thể âm"), { status: 400 });

      await tx.users.update({ where: { id }, data: { points_balance: newBalance } });
      await tx.pointTransactions.create({
        data: {
          user_id: id,
          type: "ADJUST",
          points: delta,
          balance_after: newBalance,
          note: note || "Admin điều chỉnh",
        },
      });
      return { new_balance: newBalance };
    });
  },
};

export default loyaltyManagementService;
