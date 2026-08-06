import express from "express";
import {
    verifyToken,
    checkPermission,
} from "../../middlewares/verifyToken.middlware.js";
import shippingController from "../../controllers/management/shipping.controller.js";

const shippingRoute = express.Router();

shippingRoute
    .get(
        "/",
        verifyToken,
        checkPermission("xem-don-hang"),
        shippingController.getAll,
    )
    .get(
        "/:id",
        verifyToken,
        checkPermission("xem-don-hang"),
        shippingController.getById,
    );

export default shippingRoute;