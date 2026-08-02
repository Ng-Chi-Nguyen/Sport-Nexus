import paymentService from "../../services/customer/payment.service.js";

const paymentController = {
    getAllTransactions: async (req, res) => {
        try {
            const result = await paymentService.getAllTransactions({
                page: req.query.page,
                status: req.query.status,
                method: req.query.method,
                order_id: req.query.order_id,
            });
            return res.json({ success: true, data: result });
        } catch (error) {
            return res
                .status(500)
                .json({
                    success: false,
                    message: error.message || "Lỗi server nội bộ.",
                });
        }
    },

    getTransaction: async (req, res) => {
        try {
            const tx = await paymentService.getTransactionById(
                req.params.transactionId,
            );
            return res.json({ success: true, data: tx });
        } catch (error) {
            const status = error.code === "NOT_FOUND" ? 404 : 500;
            return res
                .status(status)
                .json({
                    success: false,
                    message: error.message || "Lỗi server nội bộ.",
                });
        }
    },

    confirmTransaction: async (req, res) => {
        try {
            const tx = await paymentService.confirmTransaction(
                req.params.transactionId,
                { note: req.body?.note },
            );
            return res.json({
                success: true,
                message: "Xác nhận thanh toán thành công.",
                data: tx,
            });
        } catch (error) {
            const status =
                error.code === "NOT_FOUND"
                    ? 404
                    : error.code === "INVALID_STATE"
                        ? 409
                        : 500;
            return res
                .status(status)
                .json({
                    success: false,
                    message: error.message || "Lỗi server nội bộ.",
                });
        }
    },

    cancelTransaction: async (req, res) => {
        try {
            const tx = await paymentService.cancelTransaction(
                req.params.transactionId,
            );
            return res.json({
                success: true,
                message: "Hủy giao dịch thành công.",
                data: tx,
            });
        } catch (error) {
            const status =
                error.code === "NOT_FOUND"
                    ? 404
                    : error.code === "INVALID_STATE"
                        ? 409
                        : 500;
            return res
                .status(status)
                .json({
                    success: false,
                    message: error.message || "Lỗi server nội bộ.",
                });
        }
    },

    refundTransaction: async (req, res) => {
        try {
            const tx = await paymentService.refundTransaction(
                req.params.transactionId,
            );
            return res.json({
                success: true,
                message: "Hoàn tiền thành công.",
                data: tx,
            });
        } catch (error) {
            const status =
                error.code === "NOT_FOUND"
                    ? 404
                    : error.code === "INVALID_STATE"
                        ? 409
                        : error.code === "PAYOS_NOT_CONFIGURED"
                            ? 503
                            : 500;
            return res
                .status(status)
                .json({
                    success: false,
                    message: error.message || "Lỗi server nội bộ.",
                });
        }
    },
};

export default paymentController;