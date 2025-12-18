import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import orderSchema from "../../validators/customer/order.validator.js";
import orderController from "../../controllers/customer/orther.controller.js";

const orderRoute = express.Router();

orderRoute

    .post("/", validate(orderSchema.createOrder), orderController.createOrder)
    .get("/:id", orderController.getOrderById)
    .get("/email/:email", orderController.getOrderByEmail)
    .get("/code/:code", orderController.getOrderByCode)
    .get("/", orderController.getAllOrder)

export default orderRoute;