import express from "express";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import invoiceSchema from "../../validators/management/invoice.validator.js";
import invoiceController from "../../controllers/management/invoice.controller.js";

const invoiceRoute = express.Router()

invoiceRoute
    // .post("/", verifyToken, checkPermission("tao-hoa-don"), validate(invoiceSchema.createInvoice), invoiceController.createInvoice)
    // .get("/:id", verifyToken, checkPermission("xem-hoa-don"), invoiceController.getInvoiceById)
    // .get("/", verifyToken, checkPermission("xem-hoa-don"), invoiceController.getAllInvoices)
    .post("/", validate(invoiceSchema.createInvoice), invoiceController.createInvoice)
    .get("/:id", invoiceController.getInvoiceById)
    .get("/", invoiceController.getAllInvoices)

export default invoiceRoute;
