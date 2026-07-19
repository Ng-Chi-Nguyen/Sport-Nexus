import prisma from "../../db/prisma.js";

const attributeKeyService = {
    createAttributeKey: async (dataAttributeKey) => {
        const { name, unit } = dataAttributeKey;

        let newAttribute = await prisma.AttributeKeys.create({
            data: {
                name: name,
                unit: unit
            }
        })
        return newAttribute;
    },

    getAttributeKeyById: async (attrId) => {
        let attribute = await prisma.AttributeKeys.findUnique({
            where: { id: attrId }
        })
        return attribute;
    },

    getAllAttributeKey: async ({ page, search, unit } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = {};
        if (search) where.name = { contains: search };
        if (unit !== undefined && unit !== '') {
            where.unit = unit === 'null' ? null : unit;
        }
        let [attribute, totalItems] = await Promise.all([
            prisma.AttributeKeys.findMany({
                where,
                take: limit,
                skip: skip,
            }),
            prisma.AttributeKeys.count({ where })
        ])
        return {
            attribute, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    getAllAttributesDropdown: async () => {
        let attrs = await prisma.AttributeKeys.findMany();
        return attrs;
    },

    getDistinctUnits: async () => {
        let units = await prisma.AttributeKeys.findMany({
            select: { unit: true },
            distinct: ['unit'],
        });
        return units.map(u => u.unit);
    },

    updateAttributeKey: async (attrId, dataUpdate) => {
        let attribute = await prisma.AttributeKeys.update({
            where: { id: attrId },
            data: dataUpdate
        })
        return attribute;
    },

    deleteAttributeKey: async (attrId) => {
        await prisma.AttributeKeys.delete({
            where: { id: attrId }
        })
    },
}

export default attributeKeyService;