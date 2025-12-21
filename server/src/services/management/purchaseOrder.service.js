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
        console.log(dataUpdate)
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

    },

    getPurchaseOrderBySupplierId: async (supplierId) => {

    },

}

export default purchaseOrderService;