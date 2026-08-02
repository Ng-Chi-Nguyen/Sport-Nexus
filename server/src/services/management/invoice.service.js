import prisma from "../../db/prisma.js";

const invoiceService = {
    createInvoice: async ({ order_id, note } = {}) => {
        const order = await prisma.orders.findUnique({
            where: { id: Number(order_id) },
            include: {
                OrderItems: {
                    include: {
                        product_variant: { select: { id: true } }
                    }
                },
                Users: { select: { full_name: true, email: true, phone_number: true } }
            }
        });

        if (!order) {
            const err = new Error('Không tìm thấy đơn hàng.');
            err.status = 404;
            throw err;
        }

        if (order.status === 'Cancelled') {
            const err = new Error('Không thể tạo hóa đơn cho đơn đã hủy.');
            err.status = 400;
            throw err;
        }

        const existing = await prisma.invoices.findUnique({ where: { order_id: order.id } });
        if (existing) {
            const err = new Error('Đơn hàng này đã có hóa đơn.');
            err.status = 409;
            throw err;
        }

        const subtotal = order.OrderItems.reduce(
            (sum, item) => sum + Number(item.price_at_purchase) * Number(item.quantity), 0
        );
        const discount = Number(order.discount_amount) || 0;
        const vatRate = Number(process.env.VAT_RATE) || 0.08;
        const vatAmount = Math.round((subtotal - discount) * vatRate * 100) / 100;
        const totalAmount = Math.round((subtotal - discount + vatAmount) * 100) / 100;

        const year = new Date().getFullYear();
        const start = new Date(`${year}-01-01T00:00:00Z`);
        const end = new Date(`${year + 1}-01-01T00:00:00Z`);
        const count = await prisma.invoices.count({ where: { issued_at: { gte: start, lt: end } } });
        const invoiceNumber = `HD-${year}-${String(count + 1).padStart(6, '0')}`;

        const invoice = await prisma.invoices.create({
            data: {
                invoice_number: invoiceNumber,
                order_id: order.id,
                customer_name: order.Users?.full_name || order.user_email || 'Khách vãng lai',
                customer_email: order.Users?.email || null,
                customer_phone: order.Users?.phone_number || null,
                shipping_address: order.shipping_address,
                subtotal: Math.round(subtotal * 100) / 100,
                discount_amount: discount,
                vat_rate: vatRate,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                note: note || null
            },
            include: {
                order: { select: { id: true, status: true, final_amount: true } }
            }
        });

        return invoice;
    },

    getAllInvoices: async ({ page, status, search, date_from, date_to } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        const where = {};
        if (status) where.status = status;

        if (date_from || date_to) {
            where.issued_at = {};
            if (date_from) where.issued_at.gte = new Date(date_from);
            if (date_to) where.issued_at.lte = new Date(date_to + 'T23:59:59.999Z');
        }

        if (search) {
            where.OR = [
                { invoice_number: { contains: search } },
                { customer_name: { contains: search } },
            ];
            const searchId = Number(search);
            if (!isNaN(searchId)) {
                where.OR.push({ order_id: searchId });
            }
        }

        const [invoices, totalItems] = await Promise.all([
            prisma.invoices.findMany({
                where,
                take: limit,
                skip: skip,
                include: {
                    order: { select: { id: true, status: true, final_amount: true } }
                },
                orderBy: { issued_at: 'desc' }
            }),
            prisma.invoices.count({ where })
        ]);

        return {
            invoices,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit
            }
        };
    },

    getInvoiceById: async (invoiceId) => {
        return await prisma.invoices.findUnique({
            where: { id: Number(invoiceId) },
            include: {
                order: {
                    include: {
                        OrderItems: {
                            include: {
                                product_variant: {
                                    include: {
                                        product: { select: { name: true } },
                                        VariableAttributes: {
                                            include: { attributeKey: { select: { name: true } } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}

export default invoiceService;
