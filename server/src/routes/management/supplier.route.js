import express from "express";
import supplierController from "../../controllers/management/supplier.controller.js";
import supplierSchema from "../../validators/management/supplier.vatidator.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { uploadImageLogoSupplier } from "../../middlewares/fileUpload.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";

const supplierRoute = express.Router();

supplierRoute

    .post("/", verifyToken, checkPermission("them-nha-cung-cap"), validate(supplierSchema.createSupplier), uploadImageLogoSupplier, supplierController.createSupplier)
    .get("/:id", supplierController.getSupplierById)
    .get("/", supplierController.getAllSupplier)
    .put("/:id", verifyToken, checkPermission("sua-nha-cung-cap"), validate(supplierSchema.updateSupplier), uploadImageLogoSupplier, supplierController.updateSuplier)
    .delete("/:id", verifyToken, checkPermission("xoa-nha-cung-cap"), supplierController.deleteSupplier)

export default supplierRoute;