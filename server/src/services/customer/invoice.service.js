import prisma from "../../db/prisma.js";

const invoiceService = {
    getMyInvoices: async ({ email, page, status } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        const where = { customer_email: email };
        if (status) where.status = status;

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

    getMyInvoiceDetail: async (invoiceId, email) => {
        return await prisma.invoices.findFirst({
            where: { id: Number(invoiceId), customer_email: email },
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
