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

    getAllAttributeKey: async () => {
        let attribute = await prisma.AttributeKeys.findMany()
        return attribute;
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