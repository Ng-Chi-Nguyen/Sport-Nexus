import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

export const computeCouponDiscount = (coupon, amount) => {
  let discount = 0;
  if (coupon.discount_type === "CASH") {
    discount = coupon.discount_value;
  }
  if (coupon.discount_type === "PERCENTAGE") {
    discount = amount * (coupon.discount_value / 100);
    if (discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  }
  return Math.round(discount);
};

const couponCustomerService = {
  checkCoupon: async ({ userId, amount, code }) => {
    const coupon = await prisma.coupons.findFirst({
      where: { code: code, deleted_at: ACTIVE },
    });

    if (!coupon) return { message: "Mã giảm giá không tồn tại" };
    if (!coupon.is_active) return { message: "Mã giảm giá đã hết hiệu lực" };

    const now = new Date();
    if (now < coupon.start_date)
      return { message: "Mã giảm giá chưa đến thời hạn sử dụng" };
    if (now > coupon.end_date) return { message: "Mã giảm giá đã hết hạn" };
    if (coupon.usage_count >= coupon.usage_limit)
      return { message: "Mã giảm giá đã hết lượt sử dụng" };
    if (amount < coupon.min_order_value) {
      return {
        message: "Đơn hàng giá tối thiểu mới có hiệu lực",
        min_order_value: coupon.min_order_value,
      };
    }

    const used = await prisma.userCoupons.findUnique({
      where: { user_id_coupon_id: { user_id: userId, coupon_id: coupon.id } },
      select: { used_count: true },
    });
    const usedCount = used?.used_count ?? 0;
    if (usedCount >= coupon.max_uses_per_user) {
      return { message: "Bạn đã dùng hết số lần của mã giảm giá này" };
    }

    const discount = computeCouponDiscount(coupon, amount);
    return {
      discount,
      newAmount: amount - discount,
      remainingUses: coupon.max_uses_per_user - usedCount,
      max_uses_per_user: coupon.max_uses_per_user,
    };
  },

  getGiftedCoupons: async (userId) => {
    const list = await prisma.userCoupons.findMany({
      where: { user_id: userId, is_gift: true },
      include: { coupon: true },
      orderBy: { created_at: "desc" },
    });
    return list.map((uc) => uc.coupon);
  },
};

export default couponCustomerService;
