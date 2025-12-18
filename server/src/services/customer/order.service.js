import prisma from "../../db/prisma.js";

const orderService = {
    createOrder: async (orderData) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items } = orderData;
        // console.log(orderData)
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
                user: { connect: { email: user_email } },
                OrderItems: {
                    create: items.map(item => ({
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                        price_at_purchase: item.price_at_purchase
                    }))
                },
            },
            include: {
                OrderItems: true
            }
        })

        return newOrder;
    },

    getOrderById: async (orderId) => {
        let order = await prisma.Orders.findUnique({
            where: { id: orderId },
            include: {
                OrderItems: true
            }
        })

        return order;
    },

    getOrderByEmail: async (email) => {
        // console.log(email)
        let orders = await prisma.Orders.findMany({
            where: { user_email: email },
            include: {
                OrderItems: true
            }
        })

        return orders;
    },

    getOrderByCode: async (code) => {
        let orders = await prisma.Orders.findMany({
            where: { coupon_code: code },
            include: {
                OrderItems: true
            }
        })

        return orders;
    },

    getAllOrder: async () => {
        let orders = await prisma.Orders.findMany({
            include: {
                OrderItems: true
            }
        })
        return orders;
    },

    updateOrder: async (orderId, dataUpdate) => {
        let updateOrder = await prisma.Orders.update({
            where: { id: orderId },
            data: dataUpdate,
            include: {
                OrderItems: true
            }
        })
        return updateOrder;
    },

    deleteOrder: async (orderId) => {
        await prisma.Orders.delete({
            where: { id: orderId }
        })
    }
}

export default orderService;