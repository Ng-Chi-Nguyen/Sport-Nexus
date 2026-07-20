import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import brandSchema from "../../validators/management/brand.validator.js";
import { uploadImageLogoBrand } from "../../middlewares/fileUpload.middleware.js";
import brandController from "../../controllers/management/brand.controller.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import brandService from "../../services/management/brand.service.js";

const brandRoute = express.Router();

brandRoute

    .post("/", verifyToken, checkPermission("them-thuong-hieu"), uploadImageLogoBrand, validate(brandSchema.createBrand),
      logAction({ actionType: "CREATE", entityType: "Brands", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      brandController.createBrand)
    .get("/all", brandController.getBrandsDropdown)
    .get("/:id", brandController.getBrandById)
    .get("/", brandController.getAllBrands)
    .put("/:id", verifyToken, checkPermission("sua-thuong-hieu"), uploadImageLogoBrand,
      logAction({ actionType: "UPDATE", entityType: "Brands", getOldData: fetchEntity(brandService.getBrandById), getChanges: updateDetails }),
      brandController.updateBrand)
    .delete("/:id", verifyToken, checkPermission("xoa-thuong-hieu"),
      logAction({ actionType: "DELETE", entityType: "Brands", getOldData: fetchEntity(brandService.getBrandById), getChanges: deleteDetails }),
      brandController.deleteBrand)

export default brandRoute;
