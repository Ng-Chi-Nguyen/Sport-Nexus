import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import roleSchema from "../../validators/management/role.varidator.js";
import roleController from "../../controllers/management/role.controller.js";


const roleRoute = express.Router();

roleRoute

    .post("/", validate(roleSchema.createRole), roleController.createRole)
    .put("/:id", validate(roleSchema.updateRole), roleController.updateRole)
    .get("/groups", roleController.getAllRoleGroups)
    .get("/:id", roleController.getRoleById)
    .get("/", roleController.getAllRole)
    .delete("/:id", roleController.deleteRole)

export default roleRoute;