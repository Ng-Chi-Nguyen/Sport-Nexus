import paymentService from "../../services/customer/payment.service.js";

import { t } from "../../locales/messages.js";

const paymentController = {
    getMethods: async (req, res) => {
        return res.json({
            success: true,
            data: paymentService.getAvailableMethods(),
        });
    },

    createPayment: async (req, res) => {
        try {
            const orderId = Number(req.params.orderId);
            const { method, channel } = req.body;
            const result = await paymentService.createTransaction({
                orderId,
                method,
                channel,
            });
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            const status =
                { NOT_FOUND: 404, INVALID_METHOD: 400, PAYOS_NOT_CONFIGURED: 503 }[
                error.code
                ] || 500;
            return res
                .status(status)
                .json({
                    success: false,
                    message: t(req, error.message) || "Lỗi server nội bộ.",
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
                    message: t(req, error.message) || "Lỗi server nội bộ.",
                });
        }
    },

    getOrderTransactions: async (req, res) => {
        try {
            const list = await paymentService.getTransactionsByOrder(
                req.params.orderId,
            );
            return res.json({ success: true, data: list });
        } catch (error) {
            return res
                .status(500)
                .json({
                    success: false,
                    message: t(req, error.message) || "Lỗi server nội bộ.",
                });
        }
    },

    getOrderPaymentStatus: async (req, res) => {
        try {
            const data = await paymentService.getOrderPaymentStatus(
                req.params.orderId,
            );
            return res.json({ success: true, data });
        } catch (error) {
            const status = error.code === "NOT_FOUND" ? 404 : 500;
            return res
                .status(status)
                .json({
                    success: false,
                    message: t(req, error.message) || "Lỗi server nội bộ.",
                });
        }
    },

    uploadReceipt: async (req, res) => {
        try {
            const tx = await paymentService.uploadReceipt(req.params.transactionId, {
                transaction_code: req.body.transaction_code,
                note: req.body.note,
                fileBuffer: req.file ? req.file.buffer : null,
            });
            return res.json({ success: true, data: tx });
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
                    message: t(req, error.message) || "Lỗi server nội bộ.",
                });
        }
    },

    handlePayosWebhook: async (req, res) => {
        try {
            const result = await paymentService.handlePayosWebhook(req.body);
            return res.json({ success: true, data: result });
        } catch (error) {
            console.error("Lỗi xử lý webhook PayOS:", error.message);
            return res
                .status(400)
                .json({
                    success: false,
                    message: t(req, error.message) || "Webhook không hợp lệ.",
                });
        }
    },

    handleCassoWebhook: async (req, res) => {
        try {
            const result = await paymentService.handleCassoWebhook({
                headers: req.headers,
                body: req.body,
            });
            return res.json({ success: true, data: result });
        } catch (error) {
            console.error("Lỗi xử lý webhook Casso:", error.message);
            return res
                .status(400)
                .json({
                    success: false,
                    message: t(req, error.message) || "Webhook không hợp lệ.",
                });
        }
    },
};

export default paymentController;