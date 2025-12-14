import express from "express";
import productController from "../../controllers/core/product.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import productSchema from "../../validators/core/product.validator.js";
import { uploadImage } from "../../services/image.service.js";
import { uploadThubnailProduct } from "../../middlewares/fileUpload.middleware.js";

const productRoute = express.Router();

productRoute

    .post("/", validate(productSchema.createProduct), uploadThubnailProduct, productController.createProduct)

export default productRoute;