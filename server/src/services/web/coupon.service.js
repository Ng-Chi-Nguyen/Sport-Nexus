import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

const couponWebService = {
    getActiveCoupons: async () => {
        const now = new Date();
        const list_coupons = await prisma.coupons.findMany({
            where: {
                deleted_at: ACTIVE,
                is_active: true,
                start_date: { lte: now },
                end_date: { gte: now },
            },
            orderBy: { created_at: 'desc' },
        });
        return list_coupons;
    },

    getCouponsByCodes: async (codes) => {
        if (!Array.isArray(codes) || codes.length === 0) return [];
        return prisma.coupons.findMany({
            where: { code: { in: codes }, deleted_at: ACTIVE },
        });
    },
};

export default couponWebService;
