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

paymentRoute.get("/methods", paymentController.getMethods);
paymentRoute.get(
    "/orders/:orderId/transactions",
    verifyToken,
    paymentController.getOrderTransactions,
);
paymentRoute.get(
    "/orders/:orderId/status",
    verifyToken,
    paymentController.getOrderPaymentStatus,
);
paymentRoute.get(
    "/transactions/:transactionId",
    verifyToken,
    paymentController.getTransaction,
);
paymentRoute.post(
    "/orders/:orderId",
    verifyToken,
    validate(paymentSchema.createPayment),
    paymentController.createPayment,
);
paymentRoute.post(
    "/transactions/:transactionId/receipt",
    verifyToken,
    upload.single("receipt_image"),
    validate(paymentSchema.uploadReceipt),
    paymentController.uploadReceipt,
);
paymentRoute.post(
    "/webhook/payos",
    express.json({ type: "application/json" }),
    paymentController.handlePayosWebhook,
);
paymentRoute.post(
    "/webhook/casso",
    express.json({ type: "application/json" }),
    paymentController.handleCassoWebhook,
);

export default paymentRoute;