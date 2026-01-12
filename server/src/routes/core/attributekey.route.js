import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import attributeKeySchema from "../../validators/core/attributekey.validator.js";
import attributeKeyController from "../../controllers/core/attributekey.controller.js";

const attriButeKeyRoute = express.Router();

attriButeKeyRoute

    .post("/", validate(attributeKeySchema.createAttributeKey), attributeKeyController.createAttributeKey)
    .get("/all", attributeKeyController.getAllAttributesDropdown)
    .get("/:id", attributeKeyController.getAttributeKeyById)
    .get("/", attributeKeyController.getAllAttributeKey)
    .put("/:id", validate(attributeKeySchema.updateAttributeKey), attributeKeyController.updateAttributeKeyBy)
    .delete("/:id", attributeKeyController.deleteAttributeKey)

export default attriButeKeyRoute;