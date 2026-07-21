import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import productAttributeKeySchema from "../../validators/management/productAttributeKey.validator.js";
import productAttributeKeyController from "../../controllers/management/productAttributeKey.controller.js";

const productAttributeKeyRoute = express.Router();

productAttributeKeyRoute
    .post("/", validate(productAttributeKeySchema.create), productAttributeKeyController.create)
    .get("/by-product/:productId", productAttributeKeyController.getByProduct)
    .get("/:id", productAttributeKeyController.getById)
    .get("/", productAttributeKeyController.getAll)
    .put("/:id", validate(productAttributeKeySchema.update), productAttributeKeyController.update)
    .delete("/:id", productAttributeKeyController.delete);

export default productAttributeKeyRoute;
