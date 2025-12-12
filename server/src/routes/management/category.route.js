import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import categorySchema from "../../validators/management/category.validator.js";
import categoryController from "../../controllers/management/categories.controller.js";
import { uploadImageCategory } from "../../middlewares/fileUpload.middleware.js";

const categoryRoute = express.Router();

categoryRoute

    .post("/", validate(categorySchema.createCategory), uploadImageCategory, categoryController.createCategory)
    .get("/:id", categoryController.getCategoryById)
    .get("/", categoryController.getAllCategory)
    .put("/:id", validate(categorySchema.updateCategory), uploadImageCategory, categoryController.updateCategory)
    .delete("/:id", categoryController.deleteCategory)

export default categoryRoute;