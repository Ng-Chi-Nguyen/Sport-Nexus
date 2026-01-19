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
        // Thêm giá trị mặc định [] cho items để tránh lỗi .map()
        let { supplier_id, expected_delivery_date, total_cost, items = [], status } = dataUpdate;

        let updatePurchaseOrder = await prisma.PurchaseOrders.update({
            where: { id: Number(purschaseOrderId) }, // Đảm bảo ID là kiểu Number
            data: {
                supplier_id: supplier_id,
                expected_delivery_date: expected_delivery_date,
                total_cost: total_cost,
                status: status,
                // Chỉ thực hiện cập nhật items nếu mảng items có dữ liệu
                PurchaseOrderItems: items.length > 0 ? {
                    deleteMany: {}, // Xóa toàn bộ item cũ để đồng bộ lại
                    create: items.map((item) => ({
                        product_variant_id: item.product_variant_id, // Sử dụng trực tiếp ID nếu DB yêu cầu
                        quantity: Number(item.quantity),
                        unit_cost_price: item.unit_cost_price
                    }))
                } : undefined
            },
            include: {
                PurchaseOrderItems: true,
            }
        });
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

    getAllPurchaseOrder: async (page) => {
        const limit = 6;
        let currentPage = Math.max(1, page);
        let skip = (currentPage - 1) * limit;
        let [purchaseOrders, totalItems] = await Promise.all([
            prisma.PurchaseOrders.findMany({
                take: limit,
                skip: skip,
                include: {
                    PurchaseOrderItems: true
                }
            }),
            prisma.PurchaseOrders.count()
        ])
        return {
            purchaseOrders, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    deletePurchaseOrder: async (purchaseOrderId) => {
        await prisma.PurchaseOrders.delete({
            where: { id: purchaseOrderId }
        })
    }
}

export default purchaseOrderService;