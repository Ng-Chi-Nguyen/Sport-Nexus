import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import authSchema from "../../validators/auth/auth.validator.js";
import authController from "../../controllers/auth/auth.controller.js";

const authRoute = express.Router();

authRoute

    .post("/login", validate(authSchema.login), authController.login)

export default authRoute;
