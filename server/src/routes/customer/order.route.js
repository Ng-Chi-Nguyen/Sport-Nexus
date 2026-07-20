import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import orderSchema from "../../validators/customer/order.validator.js";
import orderController from "../../controllers/customer/order.controller.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import orderService from "../../services/customer/order.service.js";

const orderRoute = express.Router();

orderRoute

    .post("/", validate(orderSchema.createOrder),
      logAction({ actionType: "CREATE", entityType: "Orders", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      orderController.createOrder)
    .get("/all-dropdown", orderController.getOrderDropdown)
    .get("/:id/items", orderController.getOrderItems)
    .get("/:id", orderController.getOrderById)
    .get("/email/:email", orderController.getOrderByEmail)
    .get("/code/:code", orderController.getOrderByCode)
    .get("/", orderController.getAllOrders)
    .put("/:id", validate(orderSchema.updateOrder),
      logAction({ actionType: "UPDATE", entityType: "Orders", getOldData: fetchEntity(orderService.getOrderById), getChanges: updateDetails }),
      orderController.updateOrder)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "Orders", getOldData: fetchEntity(orderService.getOrderById), getChanges: deleteDetails }),
      orderController.deleteOrder)

export default orderRoute;
