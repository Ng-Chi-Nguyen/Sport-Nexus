import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import permissionSchema from "../../validators/management/permission.varidator.js";
import permissionController from "../../controllers/management/permission.controller.js";


const permissionRoute = express.Router();

permissionRoute

    .post("/", validate(permissionSchema.createPermission), permissionController.createRole)
    .put("/:id", validate(permissionSchema.updatePermission), permissionController.updateRole)
    .put("/slug/:slug", validate(permissionSchema.updatePermission), permissionController.updatePermissionBySlug)
    .get("/groups", permissionController.getAllRoleGroups)
    .get("/slug/:slug", permissionController.getRoleBySlug)
    .get("/:id", permissionController.getRoleById)
    .get("/", permissionController.getAllRole)
    .delete("/:id", permissionController.deleteRole)

export default permissionRoute;