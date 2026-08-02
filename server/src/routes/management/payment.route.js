import express from "express";
import {
    verifyToken,
    checkPermission,
} from "../../middlewares/verifyToken.middlware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import paymentSchema from "../../validators/customer/payment.validator.js";
import paymentController from "../../controllers/management/payment.controller.js";

const paymentRoute = express.Router();

paymentRoute
    .post(
        "/transactions/:transactionId/confirm",
        verifyToken,
        checkPermission("xem-don-hang"),
        validate(paymentSchema.adminConfirm),
        paymentController.confirmTransaction,
    )
    .post(
        "/transactions/:transactionId/refund",
        verifyToken,
        checkPermission("xem-don-hang"),
        validate(paymentSchema.adminRefund),
        paymentController.refundTransaction,
    )
    .post(
        "/transactions/:transactionId/cancel",
        verifyToken,
        checkPermission("xem-don-hang"),
        paymentController.cancelTransaction,
    )
    .get(
        "/transactions/:transactionId",
        verifyToken,
        checkPermission("xem-don-hang"),
        paymentController.getTransaction,
    )
    .get(
        "/transactions",
        verifyToken,
        checkPermission("xem-don-hang"),
        paymentController.getAllTransactions,
    );

export default paymentRoute;