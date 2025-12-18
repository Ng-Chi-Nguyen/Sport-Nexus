import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import cartItemSchema from "../../validators/customer/cartItem.validator.js";
import cartItemController from "../../controllers/customer/cartItem.controller.js";

const cartItemRoute = express.Router();

cartItemRoute

    .post("/", validate(cartItemSchema.createCartItem), cartItemController.createCartItem)
    .get("/:id", cartItemController.getCartItemById)
    .get("/cart/:id", cartItemController.getCartItemByCartId)
    .put("/:id", validate(cartItemSchema.updateCartItem), cartItemController.updateCartItem)
    .delete("/:id", cartItemController.deleteCartItem)

export default cartItemRoute;
