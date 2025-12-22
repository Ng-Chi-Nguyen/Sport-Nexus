import stockMovementService from "../../services/management/stockMovement.service.js";

const stockMovementController = {
    createStockMovement: async (req, res) => {
        let dataStockMovement = req.body;
        try {
            let newStockMovement = await stockMovementService.createStockMovement(dataStockMovement);
            return res.status(201).json({
                message: "Tồn kho đã được thêm",
                data: newStockMovement
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ.",
                error: error.message,
            });
        }
    },

    getStockMovementById: async (req, res) => {
        let stockId = parseInt(req.params.id)
        try {
            let stockMovement = await stockMovementService.getStockMovementById(stockId);
            if (!stockMovement || stockMovement.length === 0) {
                return res.status(409).json({
                    success: false,
                    message: "Không có tồn kho"
                });
            }
            // console.log(stockMovement)
            return res.status(201).json({
                success: true,
                data: stockMovement
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    getStockMovementByvarianId: async (req, res) => {
        let variantId = parseInt(req.params.id)
        try {
            let stockMovements = await stockMovementService.getStockMovementByVariantId(variantId);
            if (!stockMovements || stockMovements.length === 0) {
                return res.status(409).json({
                    success: false,
                    message: "Không có tồn kho"
                });
            }
            return res.status(201).json({
                success: true,
                data: stockMovements
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    getAllStockMovement: async (req, res) => {
        try {
            let stockMovements = await stockMovementService.getAllStockMovement();
            if (!stockMovements || stockMovements.length === 0) {
                return res.status(409).json({
                    success: false,
                    message: "Không có tồn kho"
                });
            }
            return res.status(201).json({
                success: true,
                data: stockMovements
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    updateStockMovement: async (req, res) => {
        let dataUpdate = req.body;
        let stockId = parseInt(req.params.id)
        try {
            let updateStock = await stockMovementService.updateStockMovement(stockId, dataUpdate);
            return res.status(200).json({
                success: true,
                data: updateStock,
                message: "Tồn kho đã được cập nhật"
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy tồn kho để cập nhật." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message
            });
        }
    },

    deleteStockMovement: async (req, res) => {
        let stockId = parseInt(req.params.id)
        try {
            await stockMovementService.deleteStockMovement(stockId);
            return res.status(200).json({
                success: true,
                message: "Tồn kho đã được xóa"
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy tồn kho để cập nhật." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message
            });
        }
    }
}

export default stockMovementController;