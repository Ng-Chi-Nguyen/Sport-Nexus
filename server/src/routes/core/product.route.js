import express from "express";
import productController from "../../controllers/core/product.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import productSchema from "../../validators/core/product.validator.js";
import { uploadThubnailProduct } from "../../middlewares/fileUpload.middleware.js";

const productRoute = express.Router();

productRoute

    .post("/", validate(productSchema.createProduct), uploadThubnailProduct, productController.createProduct)
    .get("/:id", productController.getProductById)
    .get("/brand/:id", productController.getProductByBrandId)
    .get("/category/:id", productController.getProductByCategoryId)
    .get("/supplier/:id", productController.getProductBySupplierId)
    .get("/", productController.getAllProduct)
    .put("/:id", validate(productSchema.updateProduct), uploadThubnailProduct, productController.updateProduct)
    .delete("/:id", productController.deleteProduct)

export default productRoute;