import purchaseOrderService from "../../services/management/purchaseOrder.service.js";

const purchaseOrderController = {
    createPurchaseOrder: async (req, res) => {
        let purchaseOrderData = req.body;
        try {
            // console.log("purchaseOrdeData: ", purchaseOrderData)
            let newPurchaseOrder = await purchaseOrderService.createPurchaseOrder(purchaseOrderData)
            return res.status(201).json({
                success: true,
                message: "Đơn hàng đã được thêm",
                data: newPurchaseOrder
            })
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy (Sản phẩm - Nhà cung cấp bạn gữi)." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    updatePurchaseOrder: async (req, res) => {
        let dataUpdate = req.body;
        let purchaseOrderId = parseInt(req.params.id);
        try {
            let updatePurchaseOrder = await purchaseOrderService.updatePurchaseOrder(purchaseOrderId, dataUpdate)
            return res.status(200).json({
                success: true,
                message: "Cập nhật đơn hàng thành công",
                data: updatePurchaseOrder
            })
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy (Sản phẩm - Nhà cung cấp bạn gữi)." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    getPurchaseOrderById: async (req, res) => {
        let purchaseOrderId = parseInt(req.params.id);
        try {
            let purchaseOrder = await purchaseOrderService.getPurchaseOrderById(purchaseOrderId)
            if (!purchaseOrder || purchaseOrder.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn nhập hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: purchaseOrder
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy (Sản phẩm - Nhà cung cấp bạn gữi)." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            })
        }
    },

    getPurchaseOrderBySupplierId: async (req, res) => {
        let supplierId = parseInt(req.params.id);
        try {
            let purchaseOrders = await purchaseOrderService.getPurchaseOrderBySupplierId(supplierId)
            if (!purchaseOrders || purchaseOrders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn nhập hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: purchaseOrders
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy (Sản phẩm - Nhà cung cấp bạn gữi)." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            })
        }
    },

    getAllPurchaseOrder: async (req, res) => {
        let page = parseInt(req.query.page || 1)
        try {
            let purchaseOrders = await purchaseOrderService.getAllPurchaseOrder(page);
            if (!purchaseOrders || purchaseOrders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn nhập hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: purchaseOrders
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy (Sản phẩm - Nhà cung cấp bạn gữi)." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            })
        }
    },

    deletePurchaseOrder: async (req, res) => {
        let purchaseOrderId = parseInt(req.params.id);
        try {
            await purchaseOrderService.deletePurchaseOrder(purchaseOrderId)

            return res.status(200).json({
                success: true,
                message: "Đơn hàng đã được xóa"
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy (Sản phẩm - Nhà cung cấp bạn gữi)." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            })
        }
    }
}

export default purchaseOrderController;