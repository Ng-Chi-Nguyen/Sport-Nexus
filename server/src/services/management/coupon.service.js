import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";


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

    getAllCoupon: async ({ page, is_active, search, discount_type, date_from, date_to, discount_min, discount_max, include_deleted } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = { deleted_at: ACTIVE };
        if (is_active !== undefined && is_active !== '') {
            where.is_active = is_active === 'true';
        }
        if (search) {
            where.code = { contains: search };
        }
        if (discount_type) {
            where.discount_type = discount_type;
        }
        if (date_from || date_to) {
            where.start_date = {};
            if (date_from) where.start_date.gte = new Date(date_from);
        }
        if (date_to) {
            where.end_date = { lte: new Date(date_to) };
        }
        if (discount_min !== undefined && discount_min !== '') {
            where.discount_value = { ...where.discount_value, gte: parseInt(discount_min) };
        }
        if (discount_max !== undefined && discount_max !== '') {
            where.discount_value = { ...where.discount_value, lte: parseInt(discount_max) };
        }
        if (include_deleted) delete where.deleted_at;
        let [list_coupons, totalItems] = await Promise.all([
            prisma.coupons.findMany({
                where,
                take: limit,
                skip: skip,
                orderBy: { created_at: 'desc' },
            }),
            prisma.coupons.count({ where })
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
        await prisma.coupons.update({
            where: { id: couponId },
            data: { deleted_at: new Date() }
        })
    },

    checkCoupon: async (amount, code) => {
        const coupon = await prisma.coupons.findFirst({
            where: { code: code, deleted_at: ACTIVE }
        })

        // console.log(coupon)

        if (!coupon) {
            return { message: "Mã giảm giá không tồn tại" }
        };

        if (!coupon.is_active) {
            return { message: "Mã giảm giá đã hết hiệu lực" }
        };

        if (amount < coupon.min_order_value) {
            return { message: `Đơn hàng giá tối thiểu là ${coupon.min_order_value}đ mới có hiệu lực` }
        }

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

        const newAmount = amount - discount;

        return {
            oldAmount: amount,
            discount,
            newAmount
        };
    }
}


export default couponService;