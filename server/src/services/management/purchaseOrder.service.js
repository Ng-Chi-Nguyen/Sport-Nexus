import prisma from "../../db/prisma.js";

const purchaseOrderService = {
    createPurchaseOrder: async (purchaseOrderData) => {
        let { supplier_id, expected_delivery_date, total_cost, items } = purchaseOrderData;
        let newPurchaseOrder = await prisma.purchaseOrders.create({
            data: {
                supplier_id: supplier_id,
                expected_delivery_date: expected_delivery_date,
                total_cost: total_cost,
                PurchaseOrderItems: {
                    create: items.map((item) => ({
                        product_variant: { connect: { id: item.product_variant_id } },
                        quantity: item.quantity,
                        unit_cost_price: item.unit_cost_price
                    }))
                }
            },
            include: {
                PurchaseOrderItems: true,
            }
        })
        return newPurchaseOrder;
    },

    updatePurchaseOrder: async (purschaseOrderId, dataUpdate) => {
        let { supplier_id, expected_delivery_date, total_cost, items } = dataUpdate;
        // console.log(dataUpdate)
        let updatePurchaseOrder = await prisma.PurchaseOrders.update({
            where: { id: purschaseOrderId },
            data: {
                supplier_id: supplier_id,
                expected_delivery_date: expected_delivery_date,
                total_cost: total_cost,
                PurchaseOrderItems: {
                    deleteMany: {},
                    create: items.map((item) => ({
                        product_variant: { connect: { id: item.product_variant_id } },
                        quantity: item.quantity,
                        unit_cost_price: item.unit_cost_price
                    }))
                }
            },
            include: {
                PurchaseOrderItems: true,
            }
        })
        return updatePurchaseOrder;
    },

    getPurchaseOrderById: async (purchaseOrderId) => {
        let purchaseOrder = await prisma.PurchaseOrders.findUnique({
            where: { id: purchaseOrderId },
            include: {
                PurchaseOrderItems: true
            }
        })
        return purchaseOrder;
    },

    getPurchaseOrderBySupplierId: async (supplierId) => {
        let purchaseOrders = await prisma.PurchaseOrders.findMany({
            where: { supplier_id: supplierId },
            include: {
                PurchaseOrderItems: true
            }
        })
        return purchaseOrders;
    },

    getAllPurchaseOrder: async () => {
        let purchaseOrders = await prisma.PurchaseOrders.findMany({
            include: {
                PurchaseOrderItems: true
            }
        })
        return purchaseOrders;
    },

    deletePurchaseOrder: async (purchaseOrderId) => {
        await prisma.PurchaseOrders.delete({
            where: { id: purchaseOrderId }
        })
    }
}

export default purchaseOrderService;