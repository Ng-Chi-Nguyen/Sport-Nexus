import express from "express";
import { uploadProductImage } from "../../middlewares/fileUpload.middleware.js";
import productImageController from "../../controllers/core/productImage.controller.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import productImageService from "../../services/core/productImage.service.js";

const productImageRoute = express.Router();

productImageRoute

    .post("/", uploadProductImage,
      logAction({ actionType: "CREATE", entityType: "ProductImages", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      productImageController.createProductImage)
    .get("/:id", productImageController.getProductImageById)
    .get("/product/:id", productImageController.getProductImageByProductId)
    .put("/:id", uploadProductImage,
      logAction({ actionType: "UPDATE", entityType: "ProductImages", getOldData: fetchEntity(productImageService.getProductImageById), getChanges: updateDetails }),
      productImageController.updateProductImage)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "ProductImages", getOldData: fetchEntity(productImageService.getProductImageById), getChanges: deleteDetails }),
      productImageController.deleteProductImageById)
    .delete("/product/:id", productImageController.deleteProductImageByProductId)

export default productImageRoute;
