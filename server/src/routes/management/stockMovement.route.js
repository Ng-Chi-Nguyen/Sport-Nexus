import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import stockMovementSchema from "../../validators/management/stockMovement.validator.js";
import stockMovementController from "../../controllers/management/stockMovement.controller.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import stockMovementService from "../../services/management/stockMovement.service.js";

const stockMovementRoute = express.Router();

stockMovementRoute

    .post("/import", verifyToken, checkPermission("them-nhap-kho-hang"), validate(stockMovementSchema.createStockMovement),
      logAction({ actionType: "STOCK_ADJUSTMENT", entityType: "StockMovements", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      stockMovementController.import)
    .post("/export", verifyToken, checkPermission("them-nhap-kho-hang"), validate(stockMovementSchema.createStockMovement),
      logAction({ actionType: "STOCK_ADJUSTMENT", entityType: "StockMovements", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      stockMovementController.export)
    .put("/:id", verifyToken, checkPermission("sua-kho-hang"), validate(stockMovementSchema.updateStockMovement),
      logAction({ actionType: "UPDATE", entityType: "StockMovements", getOldData: fetchEntity(stockMovementService.getStockMovementById), getChanges: updateDetails }),
      stockMovementController.updateStockMovement)
    .delete("/:id", verifyToken, checkPermission("xoa-kho-hang"),
      logAction({ actionType: "DELETE", entityType: "StockMovements", getOldData: fetchEntity(stockMovementService.getStockMovementById), getChanges: deleteDetails }),
      stockMovementController.deleteStockMovement)

    .get("/:id", stockMovementController.getStockMovementById)
    .get("/variant/:id", stockMovementController.getStockMovementByvarianId)
    .get("/", stockMovementController.getAllStockMovement)

export default stockMovementRoute;
