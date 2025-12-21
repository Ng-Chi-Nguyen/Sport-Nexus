import prisma from "../../db/prisma.js";

const stockMovementService = {
    createStockMovement: async (dataStockMovement) => {
        let { variant_id, type, quantity_change, referen_id, reason } = dataStockMovement;
        let newStockMovement = await prisma.stockMovements.create({
            data: {
                variant: variant_id,
                type: type,
                quantity_change: quantity_change,
                reason: reason,
                reference_id: referen_id
            }
        })
        return newStockMovement;
    },

    getStockMovementById: async (stockId) => {
        let stock = await prisma.StockMovements.findUniQue({
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