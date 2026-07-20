import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import couponSchema from "../../validators/management/coupon.validator.js";
import couponController from "../../controllers/management/coupons.controller.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import couponService from "../../services/management/coupon.service.js";

const couponRoute = express.Router()

couponRoute

    .post("/", verifyToken, checkPermission("them-ma-giam-gia"), validate(couponSchema.createCoupon),
      logAction({ actionType: "CREATE", entityType: "Coupons", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      couponController.createCoupon)
    .put("/:id", verifyToken, checkPermission("sua-ma-giam-gia"), validate(couponSchema.updateCoupon),
      logAction({ actionType: "UPDATE", entityType: "Coupons", getOldData: fetchEntity(couponService.getCouponById), getChanges: updateDetails }),
      couponController.updateCoupon)
    .delete("/:id", verifyToken, checkPermission("xoa-ma-giam-gia"),
      logAction({ actionType: "DELETE", entityType: "Coupons", getOldData: fetchEntity(couponService.getCouponById), getChanges: deleteDetails }),
      couponController.deleteCoupon)

    .get("/:id", couponController.getCouponById)
    .get("/", couponController.getAllCoupon)

    .post("/check/", validate(couponSchema.checkCoupon), couponController.checkCoupon)

export default couponRoute;
