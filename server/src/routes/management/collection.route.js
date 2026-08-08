import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import collectionSchema from "../../validators/management/collection.validator.js";
import collectionController from "../../controllers/management/collection.controller.js";
import { uploadImageCollection } from "../../middlewares/fileUpload.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import collectionService from "../../services/management/collection.service.js";

const collectionRoute = express.Router();

collectionRoute

    .post("/", verifyToken, checkPermission("them-bo-suu-tap"), validate(collectionSchema.createCollection), uploadImageCollection,
      logAction({ actionType: "CREATE", entityType: "Collections", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      collectionController.createCollection)
    .put("/:id", verifyToken, checkPermission("sua-bo-suu-tap"), validate(collectionSchema.updateCollection), uploadImageCollection,
      logAction({ actionType: "UPDATE", entityType: "Collections", getOldData: fetchEntity(collectionService.getCollectionById), getChanges: updateDetails }),
      collectionController.updateCollection)
    .delete("/:id", verifyToken, checkPermission("xoa-bo-suu-tap"),
      logAction({ actionType: "DELETE", entityType: "Collections", getOldData: fetchEntity(collectionService.getCollectionById), getChanges: deleteDetails }),
      collectionController.deleteCollection)

    .get("/:id", collectionController.getCollectionById)
    .get("/", collectionController.getAllCollection)

export default collectionRoute;
