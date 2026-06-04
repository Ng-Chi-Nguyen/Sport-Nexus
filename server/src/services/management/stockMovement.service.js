import prisma from "../../db/prisma.js";

const stockMovementService = {
    import: async (dataStockMovement) => {
        const { type, order_id, reason, items } = dataStockMovement;
        return await prisma.$transaction(async (tx) => {
            const createdMovements = [];
            for (const item of items) {
                const { product_variant_id, quantity } = item;
                await tx.productVariants.update({
                    where: { id: product_variant_id },
                    data: { stock: { increment: quantity } }
                });
                const movement = await tx.StockMovements.create({
                    data: {
                        variant: { connect: { id: product_variant_id } },
                        type: "IN",
                        quantity_change: quantity,
                        reason: reason || `Nhập hàng theo đơn #${order_id}`,
                        reference_id: order_id
                    }
                });
                createdMovements.push(movement);
            }

            if (order_id) {
                await tx.purchaseOrders.update({
                    where: { id: order_id },
                    data: { status: "RECEIVED" }
                });
            }

            return createdMovements;
        });
    },

    export: async (dataStockMovement) => {
        const { order_id, reason, items } = dataStockMovement;

        return await prisma.$transaction(async (tx) => {
            const createdMovements = [];

            for (const item of items) {
                const { product_variant_id, quantity } = item;

                // Kiểm tra xem hàng trong kho có đủ để xuất không
                const variant = await tx.productVariants.findUnique({
                    where: { id: product_variant_id }
                });

                if (!variant) {
                    throw new Error(`Sản phẩm mã ID ${product_variant_id} không tồn tại!`);
                }

                if (variant.stock < quantity) {
                    throw new Error(`Sản phẩm "${variant.id}" không đủ số lượng để xuất! (Hiện có: ${variant.stock}, Cần xuất: ${quantity})`);
                }

                // Trừ bớt số lượng trong kho
                await tx.productVariants.update({
                    where: { id: product_variant_id },
                    data: { stock: { decrement: quantity } }
                });

                // Lưu lịch sử biến động (Lưu số âm cho đơn xuất)
                const movement = await tx.StockMovements.create({
                    data: {
                        variant: { connect: { id: product_variant_id } },
                        type: "OUT",
                        quantity_change: -quantity,
                        reason: reason || `Xuất kho tự động theo đơn #${order_id}`,
                        reference_id: order_id
                    }
                });
                createdMovements.push(movement);
            }

            if (order_id) {
                await tx.Orders.update({
                    where: { id: order_id },
                    data: { status: "Shipping" }
                });
            }

            return createdMovements;
        });
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

    getAllStockMovement: async (page) => {
        const limit = 6;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        let [list_stocks, totalItems] = await Promise.all([
            prisma.productVariants.findMany({
                take: limit,
                skip: skip,
                include: {
                    product: true,
                    VariableAttributes: {
                        include: {
                            attributeKey: true
                        }
                    }
                }
            }),

            prisma.productVariants.count()
        ])
        return {
            list_stocks, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
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