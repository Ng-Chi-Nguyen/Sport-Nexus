import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import loyaltySchema from "../../validators/customer/loyalty.validator.js";
import loyaltyCustomerController from "../../controllers/customer/loyalty.controller.js";

const loyaltyCustomerRoute = express.Router();

loyaltyCustomerRoute.use(verifyToken);

loyaltyCustomerRoute
  .get("/membership", loyaltyCustomerController.getMembership)
  .get("/rewards", loyaltyCustomerController.getRewards)
  .get("/transactions", loyaltyCustomerController.getTransactions)
  .post("/rewards/:rewardId/redeem", loyaltyCustomerController.redeemReward)
  .post("/apply-points", validate(loyaltySchema.applyPoints), loyaltyCustomerController.applyPoints);

export default loyaltyCustomerRoute;
