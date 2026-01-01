import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import authSchema from "../../validators/auth/auth.validator.js";
import authController from "../../controllers/auth/auth.controller.js";

const authRoute = express.Router();

authRoute

    .post("/login", validate(authSchema.login), authController.login)
    .post("/logout/:id", authController.logout)
    .get("/token/:token", authController.verifyAccount)

export default authRoute;
