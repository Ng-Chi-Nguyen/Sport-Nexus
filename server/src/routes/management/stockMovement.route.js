import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import stockMovementSchema from "../../validators/management/stockMovement.validator.js";
import stockMovementController from "../../controllers/management/stockMovement.controller.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";

const stockMovementRoute = express.Router();

stockMovementRoute

    .post("/import", verifyToken, checkPermission("them-nhap-kho-hang"), validate(stockMovementSchema.createStockMovement), stockMovementController.import)
    .post("/export", verifyToken, checkPermission("them-nhap-kho-hang"), validate(stockMovementSchema.createStockMovement), stockMovementController.export)
    .put("/:id", verifyToken, checkPermission("sua-kho-hang"), validate(stockMovementSchema.updateStockMovement), stockMovementController.updateStockMovement)
    .delete("/:id", verifyToken, checkPermission("xoa-kho-hang"), stockMovementController.deleteStockMovement)

    .get("/:id", stockMovementController.getStockMovementById)
    .get("/variant/:id", stockMovementController.getStockMovementByvarianId)
    .get("/", stockMovementController.getAllStockMovement)

export default stockMovementRoute;