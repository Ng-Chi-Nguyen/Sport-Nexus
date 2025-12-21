import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import stockMovementSchema from "../../validators/management/stockMovement.validator.js";
import stockMovementController from "../../controllers/management/stockMovement.controller.js";

const stockMovementRoute = express.Router();

stockMovementRoute

    .post("/", validate(stockMovementSchema.createStockMovement), stockMovementController.createStockMovement)
    .put("/:id", validate(stockMovementSchema.updateStockMovement), stockMovementController.updateStockMovement)
    .get("/:id", stockMovementController.getStockMovementById)
    .get("/variant/:id", stockMovementController.getStockMovementByvarianId)
    .get("/", stockMovementController.getAllStockMovement)
    .delete("/:id", stockMovementController.deleteStockMovement)

export default stockMovementRoute;