import express from "express";
import productController from "../../controllers/web/product.controller.js";

const webProductRoute = express.Router();

webProductRoute
    .get("/products", productController.getProducts)
    .get("/search", productController.searchProducts)
    .get("/by-ids", productController.getProductsByIds)
    .get("/related/:productId", productController.getRelatedProducts)
    .get("/slug/:slug", productController.getProductBySlug);

export default webProductRoute;
