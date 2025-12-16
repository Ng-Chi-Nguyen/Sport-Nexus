import express from "express";
import { uploadProductImage } from "../../middlewares/fileUpload.middleware.js";
import productImageController from "../../controllers/core/productImage.controller.js";

const productImageRoute = express.Router();

productImageRoute

    .post("/", uploadProductImage, productImageController.createProductImage)
    .get("/:id", productImageController.getProductImageById)
    .get("/product/:id", productImageController.getProductImageByProductId)
    .put("/:id", uploadProductImage, productImageController.updateProductImage)
    .delete("/:id", productImageController.deleteProductImageById)
    .delete("/product/:id", productImageController.deleteProductImageByProductId)

export default productImageRoute;