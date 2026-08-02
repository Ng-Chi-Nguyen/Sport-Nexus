import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import invoiceController from "../../controllers/customer/invoice.controller.js";

const invoiceRoute = express.Router();

invoiceRoute

    .get("/:id", verifyToken, invoiceController.getMyInvoiceDetail)
    .get("/", verifyToken, invoiceController.getMyInvoices)

export default invoiceRoute;
