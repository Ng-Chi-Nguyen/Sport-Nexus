import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import couponSchema from "../../validators/customer/coupon.validator.js";
import couponCustomerController from "../../controllers/customer/coupon.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";

const couponCustomerRoute = express.Router();

couponCustomerRoute
  .post(
    "/check",
    verifyToken,
    validate(couponSchema.checkCoupon),
    couponCustomerController.checkCoupon,
  )
  .get("/gifted", verifyToken, couponCustomerController.getGiftedCoupons);

export default couponCustomerRoute;