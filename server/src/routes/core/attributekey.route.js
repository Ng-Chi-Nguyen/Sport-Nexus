import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import attributeKeySchema from "../../validators/core/attributekey.validator.js";
import attributeKeyController from "../../controllers/core/attributekey.controller.js";
import { attachExcelCrudImportRoutes } from "../helpers/excelCrudImport.route.js";

const attriButeKeyRoute = express.Router();

attachExcelCrudImportRoutes(attriButeKeyRoute, { moduleKey: "attributeKey", exportPermission: "xem-thuoc-tinh" });

attriButeKeyRoute

    .post("/", validate(attributeKeySchema.createAttributeKey), attributeKeyController.createAttributeKey)
    .get("/all", attributeKeyController.getAllAttributesDropdown)
    .get("/units", attributeKeyController.getDistinctUnits)
    .get("/:id", attributeKeyController.getAttributeKeyById)
    .get("/", attributeKeyController.getAllAttributeKey)
    .put("/:id", validate(attributeKeySchema.updateAttributeKey), attributeKeyController.updateAttributeKeyBy)
    .delete("/:id", attributeKeyController.deleteAttributeKey)

export default attriButeKeyRoute;
