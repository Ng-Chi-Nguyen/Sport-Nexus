import express from "express";
import productController from "../../controllers/web/product.controller.js";

const webProductRoute = express.Router();

webProductRoute

    .get("/slug/:slug", productController.getProductBySlug)

export default webProductRoute;
