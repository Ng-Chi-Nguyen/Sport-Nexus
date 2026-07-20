import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import purchaseOrderSchema from "../../validators/management/purchaseOrder.validator.js";
import purchaseOrderController from "../../controllers/management/purchaseOrder.controller.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import purchaseOrderService from "../../services/management/purchaseOrder.service.js";

const purchaseOrderRoute = express.Router()

purchaseOrderRoute

    .post("/", validate(purchaseOrderSchema.createPurchaseOrder),
      logAction({ actionType: "CREATE", entityType: "PurchaseOrders", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      purchaseOrderController.createPurchaseOrder)
    .put("/:id", validate(purchaseOrderSchema.updatePurchaseOrder),
      logAction({ actionType: "UPDATE", entityType: "PurchaseOrders", getOldData: fetchEntity(purchaseOrderService.getPurchaseOrderById), getChanges: updateDetails }),
      purchaseOrderController.updatePurchaseOrder)
    .get("/dropdown", purchaseOrderController.getPurchasesDropdown)
    .get("/:id", purchaseOrderController.getPurchaseOrderById)
    .get("/supplier/:id", purchaseOrderController.getPurchaseOrderBySupplierId)
    .get("/:id/items/", purchaseOrderController.getPurchaseOrderItemById)
    .get("/", purchaseOrderController.getAllPurchaseOrder)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "PurchaseOrders", getOldData: fetchEntity(purchaseOrderService.getPurchaseOrderById), getChanges: deleteDetails }),
      purchaseOrderController.deletePurchaseOrder)

export default purchaseOrderRoute;
