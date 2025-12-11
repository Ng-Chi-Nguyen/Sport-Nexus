import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import brandSchema from "../../validators/management/brand.validator.js";
import { uploadImageLogoBrand } from "../../middlewares/fileUpload.middleware.js";
import brandController from "../../controllers/management/brand.controller.js";

const brandRoute = express.Router();

brandRoute

    .post("/", validate(brandSchema.createBrand), uploadImageLogoBrand, brandController.createBrand)

export default brandRoute;