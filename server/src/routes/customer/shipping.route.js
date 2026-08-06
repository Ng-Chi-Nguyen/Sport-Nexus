import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import shippingSchema from "../../validators/customer/shipping.validator.js";
import shippingController from "../../controllers/customer/shipping.controller.js";
import {
    verifyToken,
} from "../../middlewares/verifyToken.middlware.js";

const shippingRoute = express.Router();

shippingRoute
    .post(
        "/calculate",
        validate(shippingSchema.calculate),
        shippingController.calculate,
    )
    .post(
        "/",
        verifyToken,
        validate(shippingSchema.create),
        shippingController.create,
    )
    .get("/track/:trackingCode", shippingController.track);

export default shippingRoute;