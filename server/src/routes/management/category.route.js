import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import categorySchema from "../../validators/management/category.validator.js";
import categoryController from "../../controllers/management/categories.controller.js";
import { uploadImageCategory } from "../../middlewares/fileUpload.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";

const categoryRoute = express.Router();

categoryRoute

    .post("/", verifyToken, checkPermission("them-danh-muc"), validate(categorySchema.createCategory), uploadImageCategory, categoryController.createCategory)
    .get("/:id", categoryController.getCategoryById)
    .get("/", categoryController.getAllCategory)
    .put("/:id", verifyToken, checkPermission("sua-danh-muc"), validate(categorySchema.updateCategory), uploadImageCategory, categoryController.updateCategory)
    .delete("/:id", verifyToken, checkPermission("xoa-danh-muc"), categoryController.deleteCategory)

export default categoryRoute;