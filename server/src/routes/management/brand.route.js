import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import brandSchema from "../../validators/management/brand.validator.js";
import { uploadImageLogoBrand } from "../../middlewares/fileUpload.middleware.js";
import brandController from "../../controllers/management/brand.controller.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";

const brandRoute = express.Router();

brandRoute

    .post("/", verifyToken, checkPermission("them-thuong-hieu"), validate(brandSchema.createBrand), uploadImageLogoBrand, brandController.createBrand)
    .get("/all", brandController.getBrandsDropdown)
    .get("/:id", brandController.getBrandById)
    .get("/", brandController.getAllBrands)
    .put("/:id", verifyToken, checkPermission("sua-thuong-hieu"), uploadImageLogoBrand, brandController.updateBrand)
    .delete("/:id", verifyToken, checkPermission("xoa-thuong-hieu"), brandController.deleteBrand)

export default brandRoute;