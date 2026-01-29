import prisma from "../../db/prisma.js";

const orderService = {
    createOrder: async (orderData) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items } = orderData;

        // console.log(orderData)
        const existingUser = await prisma.Users.findUnique({
            where: { email: user_email }
        });
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
                user: existingUser
                    ? { connect: { email: user_email } }
                    : undefined,
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

    getAllOrders: async (page) => {
        // console.log(page)
        const limit = 5;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        const [orders, totalItems] = await Promise.all([
            prisma.Orders.findMany({
                take: limit,
                skip: skip,
                include: {
                    OrderItems: true
                }
            }),
            prisma.Orders.count()
        ])
        return {
            orders, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        }
    },

    updateOrder: async (orderId, dataUpdate, items) => {
        // 1. Xóa các items cũ
        await prisma.OrderItems.deleteMany({
            where: {
                order_id: orderId
            }
        });

        // 2. Cập nhật Order và tạo lại items mới
        let updateOrder = await prisma.Orders.update({
            where: { id: orderId },
            data: {
                shipping_address: dataUpdate.shipping_address,
                status: dataUpdate.status,
                total_amount: dataUpdate.total_amount,
                final_amount: dataUpdate.final_amount,
                payment_status: dataUpdate.payment_status || "Pending",
                discount_amount: dataUpdate.discount_amount || 0,

                // Khối này nằm TRONG data là đúng
                OrderItems: {
                    create: items.map(item => ({
                        product_variant_id: Number(item.product_variant_id), // Ép kiểu Number để chắc chắn
                        quantity: Number(item.quantity),
                        price_at_purchase: item.price_at_purchase
                    }))
                }
            }, // Kết thúc khối data tại đây
            include: {
                OrderItems: true
            }
        });

        return updateOrder;
    },

    deleteOrder: async (orderId) => {
        await prisma.Orders.delete({
            where: { id: orderId }
        })
    }
}

export default orderService;