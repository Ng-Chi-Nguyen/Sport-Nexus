import prisma from "../../db/prisma.js";

const orderService = {
    createOrder: async (orderData) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email } = orderData;
        console.log(orderData)
        let newOrder = await prisma.Orders.create({
            data: {
                total_amount: total_amount,
                status: status,
                shipping_address: shipping_address,
                payment_method: payment_method,
                payment_status: payment_status,
                discount_amount: discount_amount,
                final_amount: final_amount,
                coupon: coupon_code
                    ? { connect: { code: coupon_code } }
                    : undefined,
                user: { connect: { email: user_email } }
            }
        })

        return newOrder;
    },

    getOrderById: async (orderId) => {
        let order = await prisma.Orders.findUnique({
            where: { id: orderId }
        })

        return order;
    },

    getOrderByEmail: async (email) => {
        console.log(email)
        let orders = await prisma.Orders.findMany({
            where: { user_email: email }
        })

        return orders;
    },

    getOrderByCode: async (code) => {
        let orders = await prisma.Orders.findMany({
            where: { coupon_code: code }
        })

        return orders;
    },

    getAllOrder: async () => {
        let orders = await prisma.Orders.findMany()
        return orders;
    },
}

export default orderService;