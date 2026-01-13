import express from "express";
import productVariantSchema from "../../validators/core/productvariants.validator.js";
import productVariantController from "../../controllers/core/productvariants.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";

const productVariantRoute = express.Router();

productVariantRoute

    .post("/", validate(productVariantSchema.createProductVariant), productVariantController.createProductVariant)
    .get("/:id", productVariantController.getProductVariantById)
    .get("/product/:id", productVariantController.getProductVariantByProductId)
    .get("/", productVariantController.getAllProductVariants)
    .put("/:id", validate(productVariantSchema.updateProductVariant), productVariantController.updateProductVariant)
    .delete("/:id", productVariantController.deleteProductVariant)

export default productVariantRoute;