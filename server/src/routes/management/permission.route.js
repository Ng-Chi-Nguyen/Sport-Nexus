import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import roleSchema from "../../validators/management/permission.varidator.js";
import roleController from "../../controllers/management/permission.controller.js";
import permissionSchema from "../../validators/management/permission.varidator.js";
import permissionController from "../../controllers/management/permission.controller.js";


const permissionRoute = express.Router();

permissionRoute

    .post("/", validate(permissionSchema.createPermission), permissionController.createRole)
    .put("/:id", validate(permissionSchema.updatePermission), permissionController.updateRole)
    .get("/groups", permissionController.getAllRoleGroups)
    .get("/:id", permissionController.getRoleById)
    .get("/", permissionController.getAllRole)
    .delete("/:id", permissionController.deleteRole)

export default permissionRoute;