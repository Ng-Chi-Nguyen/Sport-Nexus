import express from "express";
import supplierController from "../../controllers/management/supplier.controller.js";
import supplierSchema from "../../validators/management/supplier.vatidator.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { uploadImageLogoSupplier } from "../../middlewares/fileUpload.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import supplierService from "../../services/management/supplier.service.js";

const supplierRoute = express.Router();

supplierRoute

    .post("/", verifyToken, checkPermission("them-nha-cung-cap"), validate(supplierSchema.createSupplier), uploadImageLogoSupplier,
      logAction({ actionType: "CREATE", entityType: "Suppliers", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      supplierController.createSupplier)
    .put("/:id", verifyToken, checkPermission("sua-nha-cung-cap"), validate(supplierSchema.updateSupplier), uploadImageLogoSupplier,
      logAction({ actionType: "UPDATE", entityType: "Suppliers", getOldData: fetchEntity(supplierService.getSupplierById), getChanges: updateDetails }),
      supplierController.updateSuplier)
    .delete("/:id", verifyToken, checkPermission("xoa-nha-cung-cap"),
      logAction({ actionType: "DELETE", entityType: "Suppliers", getOldData: fetchEntity(supplierService.getSupplierById), getChanges: deleteDetails }),
      supplierController.deleteSupplier)

    .get("/all", supplierController.getSuppliersDropdown)
    .get("/provinces", supplierController.getProvinces)
    .get("/:id", supplierController.getSupplierById)
    .get("/", supplierController.getAllSupplier)

export default supplierRoute;
