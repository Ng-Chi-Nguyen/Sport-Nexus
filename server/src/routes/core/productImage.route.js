import express from "express";
import { uploadProductImage } from "../../middlewares/fileUpload.middleware.js";
import productImageController from "../../controllers/core/productImage.controller.js";

const productImageRoute = express.Router();

productImageRoute

    .post("/", uploadProductImage, productImageController.createProductImage)

export default productImageRoute;