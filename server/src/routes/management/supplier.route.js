import express from "express";
import supplierController from "../../controllers/management/supplier.controller.js";
import supplierSchema from "../../validators/management/supplier.vatidator.js";
import { validate } from "../../middlewares/validation.middleware.js";

const supplierRoute = express.Router();

supplierRoute

    .post("/", validate(supplierSchema.createSupplier), supplierController.createSupplier)
    .get("/:id", supplierController.getSupplierById)

export default supplierRoute;