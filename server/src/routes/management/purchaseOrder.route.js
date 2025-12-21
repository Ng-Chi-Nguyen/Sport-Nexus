import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import purchaseOrderSchema from "../../validators/management/purchaseOrder.validator.js";
import purchaseOrderController from "../../controllers/management/purchaseOrder.controller.js";
const purchaseOrderRoute = express.Router()

purchaseOrderRoute

    .post("/", validate(purchaseOrderSchema.createPurchaseOrder), purchaseOrderController.createPurchaseOrder)
    .put("/:id", validate(purchaseOrderSchema.updatePurchaseOrder), purchaseOrderController.updatePurchaseOrder)

export default purchaseOrderRoute;