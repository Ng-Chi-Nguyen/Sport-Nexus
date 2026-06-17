import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import couponSchema from "../../validators/management/coupon.validator.js";
import couponController from "../../controllers/management/coupons.controller.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";

const couponRoute = express.Router()

couponRoute

    .post("/", verifyToken, checkPermission("them-ma-giam-gia"), validate(couponSchema.createCoupon), couponController.createCoupon)
    .put("/:id", verifyToken, checkPermission("sua-ma-giam-gia"), validate(couponSchema.updateCoupon), couponController.updateCoupon)
    .delete("/:id", verifyToken, checkPermission("xoa-ma-giam-gia"), couponController.deleteCoupon)

    .get("/:id", couponController.getCouponById)
    .get("/", couponController.getAllCoupon)

    .post("/check/", validate(couponSchema.checkCoupon), couponController.checkCoupon)

export default couponRoute;