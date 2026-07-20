import express from "express";
import productVariantSchema from "../../validators/core/productvariants.validator.js";
import productVariantController from "../../controllers/core/productvariants.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import productVariantsService from "../../services/core/productvariants.service.js";

const productVariantRoute = express.Router();

productVariantRoute

    .post("/", validate(productVariantSchema.createProductVariant),
      logAction({ actionType: "CREATE", entityType: "ProductVariants", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      productVariantController.createProductVariant)
    .get("/all", productVariantController.getProductVariantsDropdown)
    .get("/:id", productVariantController.getProductVariantById)
    .get("/product/:id", productVariantController.getProductVariantByProductId)
    .get("/", productVariantController.getAllProductVariants)
    .put("/:id", validate(productVariantSchema.updateProductVariant),
      logAction({ actionType: "UPDATE", entityType: "ProductVariants", getOldData: fetchEntity(productVariantsService.getProductVariantById), getChanges: updateDetails }),
      productVariantController.updateProductVariant)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "ProductVariants", getOldData: fetchEntity(productVariantsService.getProductVariantById), getChanges: deleteDetails }),
      productVariantController.deleteProductVariant)

export default productVariantRoute;
