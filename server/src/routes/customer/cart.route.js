import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import cartController from "../../controllers/customer/cart.controller.js";

const cartRoute = express.Router();

cartRoute.use(verifyToken);

cartRoute
    .get("/", cartController.getCart)
    .post("/sync", cartController.syncCart)

export default cartRoute;
