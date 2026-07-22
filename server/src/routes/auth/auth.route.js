import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import authSchema from "../../validators/auth/auth.validator.js";
import authController from "../../controllers/auth/auth.controller.js";
import userController from "../../controllers/management/user.controller.js";
import userSchema from "../../validators/management/user.validator.js";

const authRoute = express.Router();

authRoute

    .post("/register", validate(userSchema.createUser), userController.createUser)
    .post("/login", validate(authSchema.login), authController.login)
    .post("/google", authController.googleLogin)
    .post("/facebook", authController.facebookLogin)
    .post("/logout/:id", authController.logout)
    .post("/refresh-token", authController.refreshToken)
    .get("/token/:token", authController.verifyAccount)
    .post("/change-password", verifyToken, validate(authSchema.changePassword), authController.changePassword)
    .post("/forgot-password", validate(authSchema.forgotPassword), authController.forgotPassword)
    .post("/reset-password/:token", validate(authSchema.resetPassword), authController.resetPassword)

export default authRoute;
