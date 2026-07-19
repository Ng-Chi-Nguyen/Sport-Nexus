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
        // console.log(dataUpdate)
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

    getPurchaseOrderItemById: async (req, res) => {
        let supplierId = parseInt(req.params.id);
        try {
            let purchaseOrders = await purchaseOrderService.getPurchaseOrderItemById(supplierId)
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
        const { page, status, supplier_id, date_from, date_to, cost_min, cost_max, search } = req.query;
        try {
            let result = await purchaseOrderService.getAllPurchaseOrder({
                page: parseInt(page || 1),
                status: status || '',
                supplier_id: supplier_id || '',
                date_from: date_from || '',
                date_to: date_to || '',
                cost_min: cost_min || '',
                cost_max: cost_max || '',
                search: search || '',
            });
            if (!result || result.purchaseOrders.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: { purchaseOrders: [], pagination: { totalPages: 1, currentPage: 1 } }
                });
            }
            return res.status(200).json({
                success: true,
                data: result
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

    getPurchasesDropdown: async (req, res) => {
        try {
            const purchaseOrders = await purchaseOrderService.getPurchaseOrderDropdown();
            return res.status(200).json({
                success: true,
                data: purchaseOrders,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách đơn mua hàng tham chiếu.",
                error: error.message,
            });
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