import prisma from "../../db/prisma.js";

const stockMovementService = {
    createStockMovement: async (dataStockMovement) => {
        let { variant_id, type, quantity_change, reference_id, reason } = dataStockMovement;
        console.log(dataStockMovement)
        let newStockMovement = await prisma.StockMovements.create({
            data: {
                variant: { connect: { id: variant_id } },
                type: type,
                quantity_change: quantity_change,
                reason: reason,
                reference_id: reference_id
            }
        })
        return newStockMovement;
    },

    getStockMovementById: async (stockId) => {
        let stock = await prisma.StockMovements.findUnique({
            where: { id: stockId }
        })
        return stock;
    },

    getStockMovementByVariantId: async (variantId) => {
        let stocks = await prisma.StockMovements.findMany({
            where: { variant_id: variantId }
        })
        return stocks;
    },

    getAllStockMovement: async () => {
        let stocks = await prisma.StockMovements.findMany();
        return stocks;
    },

    updateStockMovement: async (stockId, dataStockMovement) => {
        console.log(dataStockMovement)
        let updateStock = await prisma.StockMovements.update({
            where: { id: stockId },
            data: dataStockMovement
        })
        return updateStock;
    },

    deleteStockMovement: async (stockId) => {
        await prisma.StockMovements.delete({
            where: { id: stockId }
        })
    }
}

export default stockMovementService;