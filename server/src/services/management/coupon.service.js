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

    getAllCoupon: async (page) => {
        const limit = 6;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        let [list_coupons, totalItems] = await Promise.all([
            prisma.coupons.findMany({
                take: limit,
                skip: skip,
            }),
            prisma.coupons.count()
        ])
        return {
            list_coupons, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
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