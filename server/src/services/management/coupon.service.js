import prisma from "../../db/prisma.js";


const couponService = {
    createCoupon: async (dataCoupon) => {
        let { code, discount_value, discount_type, max_discount,
            min_order_value, start_date, end_date, usage_limit, is_active } = dataCoupon;
        let usage_count = 0;
        let newCoupon = await prisma.coupons.create({
            data: {
                code: code,
                discount_value: discount_value,
                discount_type: discount_type,
                max_discount: max_discount,
                min_order_value: min_order_value,
                start_date: start_date,
                end_date: end_date,
                usage_limit: usage_limit,
                usage_count: usage_count,
                is_active: is_active,
            },
            select: {
                id: true,
                code: true,
                discount_value: true,
                discount_type: true,
                max_discount: true,
                min_order_value: true,
                start_date: true,
                end_date: true,
                usage_limit: true,
                created_at: true,
                usage_count: true,
                is_active: true
            }
        })

        return newCoupon;
    },

    getCouponById: async (couponId) => {
        let coupon = await prisma.coupons.findUnique({
            where: { id: couponId },
        })
        return coupon;
    },

    getAllCoupon: async () => {
        let list_coupons = await prisma.coupons.findMany()
        return list_coupons;
    },

    updateCoupon: async (couponId, dataUpdate) => {
        let updateData = await prisma.coupons.update({
            where: { id: couponId },
            data: dataUpdate
        })
        return updateData;
    },

    deleteCoupon: async (couponId) => {
        await prisma.coupons.delete({
            where: { id: couponId }
        })
    }
}


export default couponService;