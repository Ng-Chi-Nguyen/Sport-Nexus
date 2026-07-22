import prisma from "../../db/prisma.js";

const orderService = {
    createOrder: async (orderData) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items } = orderData;

        for (const item of items) {
            const variant = await prisma.productVariants.findUnique({
                where: { id: item.product_variant_id },
                select: { stock: true }
            })
            if (!variant || variant.stock < item.quantity) {
                const err = new Error(`Sản phẩm ID ${item.product_variant_id} không đủ hàng (còn ${variant?.stock ?? 0}, cần ${item.quantity})`)
                err.code = 'INSUFFICIENT_STOCK'
                throw err
            }
        }

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
                user_email: user_email || null,

                OrderItems: {
                    create: items.map(item => ({
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                        price_at_purchase: item.price_at_purchase
                    }))
                },
            },
            include: {
                OrderItems: {
                    include: {
                        product_variant: {
                            include: {
                                product: { select: { name: true } },
                                VariableAttributes: {
                                    include: {
                                        attributeKey: { select: { name: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (coupon_code) {
            await prisma.coupons.update({
                where: { code: coupon_code },
                data: { usage_count: { increment: 1 } }
            })
        }

        for (const item of items) {
            await prisma.productVariants.update({
                where: { id: item.product_variant_id },
                data: { stock: { decrement: item.quantity } }
            })
        }

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

    getOrderItemsById: async (orderId) => {
        return await prisma.OrderItems.findMany({
            where: { order_id: Number(orderId) },
            include: {
                product_variant: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        });
    },

    getOrderById: async (orderId) => {
        let order = await prisma.Orders.findUnique({
            where: { id: orderId },
            include: {
                OrderItems: {
                    include: {
                        product_variant: {
                            include: {
                                product: { select: { name: true } },
                                VariableAttributes: {
                                    include: {
                                        attributeKey: { select: { name: true } }
                                    }
                                }
                            }
                        }
                    }
                }
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

    getAllOrders: async ({ page, status, payment_status, payment_method, date_from, date_to, amount_min, amount_max, search } = {}) => {
        const limit = 5;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (payment_status) where.payment_status = payment_status;
        if (payment_method) where.payment_method = payment_method;
        if (search) {
            const conditions = [
                { user_email: { contains: search } },
                { coupon_code: { contains: search } },
            ];
            const searchId = Number(search);
            if (!isNaN(searchId)) {
                conditions.push({ id: searchId });
            }
            where.OR = conditions;
        }
        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) where.created_at.gte = new Date(date_from);
            if (date_to) where.created_at.lte = new Date(date_to + 'T23:59:59.999Z');
        }
        if (amount_min || amount_max) {
            where.final_amount = {};
            if (amount_min) where.final_amount.gte = Number(amount_min);
            if (amount_max) where.final_amount.lte = Number(amount_max);
        }

        const [orders, totalItems] = await Promise.all([
            prisma.Orders.findMany({
                where,
                take: limit,
                skip: skip,
                orderBy: {
                    created_at: 'desc'
                },
            include: {
                OrderItems: {
                    include: {
                        product_variant: {
                            include: {
                                product: { select: { name: true } },
                                VariableAttributes: {
                                    include: {
                                        attributeKey: { select: { name: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            }),
            prisma.Orders.count({ where })
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