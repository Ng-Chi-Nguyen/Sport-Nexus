import express from "express";
import multer from "multer";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import paymentSchema from "../../validators/customer/payment.validator.js";
import paymentController from "../../controllers/customer/payment.controller.js";

const paymentRoute = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

paymentRoute

    .get("/methods", paymentController.getMethods)
    .get(
        "/orders/:orderId/transactions",
        verifyToken,
        paymentController.getOrderTransactions,
    )
    .get(
        "/orders/:orderId/status",
        verifyToken,
        paymentController.getOrderPaymentStatus,
    )
    .get(
        "/transactions/:transactionId",
        verifyToken,
        paymentController.getTransaction,
    )
    .post(
        "/transactions/:transactionId/sync-payos",
        verifyToken,
        paymentController.syncPayosPayment,
    )
    .post(
        "/orders/:orderId",
        verifyToken,
        validate(paymentSchema.createPayment),
        paymentController.createPayment,
    )
    .post(
        "/transactions/:transactionId/receipt",
        verifyToken,
        upload.single("receipt_image"),
        validate(paymentSchema.uploadReceipt),
        paymentController.uploadReceipt,
    )
    .post(
        "/webhook/payos",
        express.json({ type: "application/json" }),
        paymentController.handlePayosWebhook,
    )
    .post(
        "/webhook/casso",
        express.json({ type: "application/json" }),
        paymentController.handleCassoWebhook,
    )

export default paymentRoute;