import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import loyaltySchema from "../../validators/management/loyalty.validator.js";
import loyaltyController from "../../controllers/management/loyalty.controller.js";

const loyaltyRoute = express.Router();

loyaltyRoute.use(verifyToken);

// Hạng thành viên
loyaltyRoute
  .get("/tiers", checkPermission("xem-hang-thanh-vien"), loyaltyController.getAllTiers)
  .post("/tiers", checkPermission("them-hang-thanh-vien"), validate(loyaltySchema.createTier), loyaltyController.createTier)
  .put("/tiers/:id", checkPermission("sua-hang-thanh-vien"), validate(loyaltySchema.updateTier), loyaltyController.updateTier)
  .delete("/tiers/:id", checkPermission("xoa-hang-thanh-vien"), loyaltyController.deleteTier);

// Bảng đổi quà
loyaltyRoute
  .get("/rewards", checkPermission("xem-qua-doi-diem"), loyaltyController.getAllRewards)
  .get("/rewards/hidden-coupons", checkPermission("xem-qua-doi-diem"), loyaltyController.getHiddenCoupons)
  .post("/rewards", checkPermission("them-qua-doi-diem"), validate(loyaltySchema.createReward), loyaltyController.createReward)
  .put("/rewards/:id", checkPermission("sua-qua-doi-diem"), validate(loyaltySchema.updateReward), loyaltyController.updateReward)
  .delete("/rewards/:id", checkPermission("xoa-qua-doi-diem"), loyaltyController.deleteReward);

// Cấu hình
loyaltyRoute
  .get("/settings", checkPermission("cau-hinh-tich-diem"), loyaltyController.getSettings)
  .put("/settings", checkPermission("cau-hinh-tich-diem"), validate(loyaltySchema.updateSettings), loyaltyController.updateSettings);

// Người dùng & điểm
loyaltyRoute
  .get("/users", checkPermission("xem-hang-thanh-vien"), loyaltyController.getUsers)
  .get("/users/:id", checkPermission("xem-hang-thanh-vien"), loyaltyController.getUserDetail)
  .post("/users/:id/adjust-points", checkPermission("cau-hinh-tich-diem"), validate(loyaltySchema.adjustPoints), loyaltyController.adjustPoints);

export default loyaltyRoute;
