import prisma from "../../db/prisma.js";

const stockMovementService = {
    createStockMovement: async (dataStockMovement) => {
        const { type, order_id, reason, items } = dataStockMovement;
        console.log("Service nhận dữ liệu mảng: ", dataStockMovement);

        // 1. Nếu là đơn ADJUSTMENT và không truyền sản phẩm nào
        if (type === "ADJUSTMENT" && (!items || items.length === 0)) {
            return await prisma.StockMovements.create({
                data: {
                    type: type,
                    quantity_change: 0,
                    reason: reason || "Điều chỉnh kho thủ công",
                    reference_id: null
                }
            });
        }

        // 2. Nếu có danh sách items (Đơn IN hoặc OUT)
        // Sử dụng $transaction để bọc tất cả các câu lệnh cập nhật kho và lưu lịch sử
        const result = await prisma.$transaction(async (tx) => {
            const createdMovements = [];

            for (const item of items) {
                const { product_variant_id, quantity } = item;

                const variant = await tx.productVariants.findUnique({
                    where: { id: product_variant_id }
                });

                if (!variant) {
                    throw new Error(`Biến thể sản phẩm với ID ${product_variant_id} không tồn tại!`);
                }

                const change = type === "IN" ? quantity : -quantity;
                const newStock = variant.stock + change;

                if (type === "OUT" && newStock < 0) {
                    throw new Error(`Sản phẩm với ID ${product_variant_id} không đủ số lượng để xuất kho! (Hiện có: ${variant.stock})`);
                }


                await tx.ProductVariants.update({
                    where: { id: product_variant_id },
                    data: {
                        stock: type === "IN" ? { increment: quantity } : { decrement: quantity }
                    }
                });

                const movement = await tx.StockMovements.create({
                    data: {
                        variant: { connect: { id: product_variant_id } },
                        type: type,
                        quantity_change: change,
                        reason: null,
                        reference_id: order_id
                    }
                });

                createdMovements.push(movement);
            }

            return createdMovements;
        });

        return result;
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