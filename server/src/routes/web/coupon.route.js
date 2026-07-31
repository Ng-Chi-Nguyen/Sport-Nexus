import express from "express";
import couponController from "../../controllers/web/coupon.controller.js";

const webCouponRoute = express.Router();

webCouponRoute.get("/list", couponController.getCouponsByCodes);
webCouponRoute.get("/active", couponController.getActiveCoupons);

export default webCouponRoute;
