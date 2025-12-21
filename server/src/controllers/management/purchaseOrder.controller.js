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
    }
}

export default purchaseOrderController;