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

    getAllAttributeKey: async (page) => {
        const limit = 6;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;

        let [attribute, totalItems] = await Promise.all([
            prisma.AttributeKeys.findMany({
                take: limit,
                skip: skip,
            }),
            prisma.AttributeKeys.count()
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