import express from "express";
import productController from "../../controllers/core/product.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import productSchema from "../../validators/core/product.validator.js";
import { uploadThubnailProduct } from "../../middlewares/fileUpload.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import productService from "../../services/core/product.service.js";

const productRoute = express.Router();

productRoute

    .post("/", verifyToken, checkPermission("them-san-pham"), validate(productSchema.createProduct), uploadThubnailProduct,
      logAction({ actionType: "CREATE", entityType: "Products", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      productController.createProduct)
    .get("/all", productController.getAllProductsDropdown)
    .get("/:id", productController.getProductById)
    .get("/brand/:id", productController.getProductByBrandId)
    .get("/category/:id", productController.getProductByCategoryId)
    .get("/supplier/:id", productController.getProductBySupplierId)
    .get("/", productController.getAllProduct)
    .put("/:id", validate(productSchema.updateProduct), uploadThubnailProduct,
      logAction({ actionType: "UPDATE", entityType: "Products", getOldData: fetchEntity(productService.getProductById), getChanges: updateDetails }),
      productController.updateProduct)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "Products", getOldData: fetchEntity(productService.getProductById), getChanges: deleteDetails }),
      productController.deleteProduct)

export default productRoute;
