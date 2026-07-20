import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import categorySchema from "../../validators/management/category.validator.js";
import categoryController from "../../controllers/management/categories.controller.js";
import { uploadImageCategory } from "../../middlewares/fileUpload.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import categoryService from "../../services/management/categories.service.js";

const categoryRoute = express.Router();

categoryRoute

    .post("/", verifyToken, checkPermission("them-danh-muc"), validate(categorySchema.createCategory), uploadImageCategory,
      logAction({ actionType: "CREATE", entityType: "Categories", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      categoryController.createCategory)
    .put("/:id", verifyToken, checkPermission("sua-danh-muc"), validate(categorySchema.updateCategory), uploadImageCategory,
      logAction({ actionType: "UPDATE", entityType: "Categories", getOldData: fetchEntity(categoryService.getCategoryById), getChanges: updateDetails }),
      categoryController.updateCategory)
    .delete("/:id", verifyToken, checkPermission("xoa-danh-muc"),
      logAction({ actionType: "DELETE", entityType: "Categories", getOldData: fetchEntity(categoryService.getCategoryById), getChanges: deleteDetails }),
      categoryController.deleteCategory)

    .get("/all", categoryController.getCategoriesDropdown)
    .get("/:id", categoryController.getCategoryById)
    .get("/", categoryController.getAllCategory)


export default categoryRoute;
