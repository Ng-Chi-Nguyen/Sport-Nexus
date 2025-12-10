import express from "express";
import supplierController from "../../controllers/management/supplier.controller.js";
import supplierSchema from "../../validators/management/supplier.vatidator.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { uploadImageLogoSupplier } from "../../middlewares/fileUpload.middleware.js";

const supplierRoute = express.Router();

supplierRoute

    .post("/", validate(supplierSchema.createSupplier), uploadImageLogoSupplier, supplierController.createSupplier)
    .get("/:id", supplierController.getSupplierById)
    .get("/", supplierController.getAllSupplier)
    .put("/:id", validate(supplierSchema.updateSupplier), uploadImageLogoSupplier, supplierController.updateSuplier)
    .delete("/:id", supplierController.deleteSupplier)

export default supplierRoute;