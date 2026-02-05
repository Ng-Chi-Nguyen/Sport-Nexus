import prisma from "../../db/prisma.js";

const orderService = {
    createOrder: async (orderData) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items } = orderData;

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
                user_email: dataUpdate.user_email || null,

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

    getOrderDropdown: async () => {
        let orders = await prisma.Orders.findMany({
            where: {
                status: "Processing",
            },
            select: {
                id: true,
                user_email: true,
                final_amount: true
            },
            orderBy: {
                created_at: 'desc' // Đơn mới nhất hiện lên đầu
            }
        });
        return orders;
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
        // 1. Ép kiểu dữ liệu để tránh lỗi DB
        const total = Number(dataUpdate.total_amount);
        const final = Number(dataUpdate.final_amount);
        const discount = Number(dataUpdate.discount_amount) || 0;

        // 2. Dùng Nested Write để xóa/tạo item trong 1 lệnh duy nhất
        return await prisma.orders.update({
            where: { id: Number(orderId) },
            data: {
                shipping_address: dataUpdate.shipping_address,
                status: dataUpdate.status,
                total_amount: total,
                final_amount: final,
                payment_status: dataUpdate.payment_status,
                payment_method: dataUpdate.payment_method,
                discount_amount: discount,
                user_email: dataUpdate.user_email || null,

                coupon: dataUpdate.coupon_code
                    ? { connect: { code: dataUpdate.coupon_code } }
                    : { disconnect: true },

                // Tự động xóa sạch item cũ và nạp item mới
                OrderItems: {
                    deleteMany: {},
                    create: items.map(item => ({
                        product_variant_id: Number(item.product_variant_id),
                        quantity: Number(item.quantity),
                        price_at_purchase: Number(item.price_at_purchase)
                    }))
                }
            },
            include: {
                OrderItems: true
            }
        });
    },

    deleteOrder: async (orderId) => {
        await prisma.Orders.delete({
            where: { id: orderId }
        })
    }
}

export default orderService;