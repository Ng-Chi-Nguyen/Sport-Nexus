import prisma from "../../db/prisma.js";

const productAttributeKeyService = {
    create: async (data) => {
        const { product_id, attribute_key_id } = data;
        return prisma.ProductAttributeKeys.create({
            data: { product_id: parseInt(product_id), attribute_key_id: parseInt(attribute_key_id) },
            include: {
                product: { select: { id: true, name: true } },
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    getAll: async ({ page = 1, product_id = '' } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        const where = {};
        if (product_id) where.product_id = parseInt(product_id);

        const [items, totalItems] = await Promise.all([
            prisma.ProductAttributeKeys.findMany({
                where,
                take: limit,
                skip,
                include: {
                    product: { select: { id: true, name: true } },
                    attributeKey: { select: { id: true, name: true, unit: true } },
                },
                orderBy: { id: 'desc' },
            }),
            prisma.ProductAttributeKeys.count({ where }),
        ]);

        return {
            data: items,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit,
            },
        };
    },

    getById: async (id) => {
        return prisma.ProductAttributeKeys.findUnique({
            where: { id: parseInt(id) },
            include: {
                product: { select: { id: true, name: true } },
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    getByProduct: async (productId) => {
        return prisma.ProductAttributeKeys.findMany({
            where: { product_id: parseInt(productId) },
            include: {
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    update: async (id, data) => {
        const updateData = {};
        if (data.product_id) updateData.product_id = parseInt(data.product_id);
        if (data.attribute_key_id) updateData.attribute_key_id = parseInt(data.attribute_key_id);

        return prisma.ProductAttributeKeys.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                product: { select: { id: true, name: true } },
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    delete: async (id) => {
        return prisma.ProductAttributeKeys.delete({ where: { id: parseInt(id) } });
    },
};

export default productAttributeKeyService;
