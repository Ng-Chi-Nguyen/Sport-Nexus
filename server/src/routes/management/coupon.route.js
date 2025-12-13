import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import couponSchema from "../../validators/management/coupon.validator.js";
import couponController from "../../controllers/management/coupons.controller.js";
const couponRoute = express.Router()

couponRoute

    .post("/", validate(couponSchema.createCoupon), couponController.createCoupon)

export default couponRoute;