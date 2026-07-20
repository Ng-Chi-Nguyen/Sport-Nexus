import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import permissionSchema from "../../validators/management/permission.varidator.js";
import permissionController from "../../controllers/management/permission.controller.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails, updateDetails, deleteDetails, fetchEntity } from "../../middlewares/log.helpers.js";
import permissionService from "../../services/management/permission.service.js";

const permissionRoute = express.Router();

permissionRoute

    .post("/", validate(permissionSchema.createPermission),
      logAction({ actionType: "CREATE", entityType: "Roles", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      permissionController.createRole)
    .put("/:id", validate(permissionSchema.updatePermission),
      logAction({ actionType: "UPDATE", entityType: "Roles", getOldData: fetchEntity(permissionService.getRoleById), getChanges: updateDetails }),
      permissionController.updateRole)
    .put("/slug/:slug", validate(permissionSchema.updatePermission), permissionController.updatePermissionBySlug)
    .get("/groups", permissionController.getAllRoleGroups)
    .get("/slug/:slug", permissionController.getRoleBySlug)
    .get("/:id", permissionController.getRoleById)
    .get("/", permissionController.getAllRole)
    .delete("/:id",
      logAction({ actionType: "DELETE", entityType: "Roles", getOldData: fetchEntity(permissionService.getRoleById), getChanges: deleteDetails }),
      permissionController.deleteRole)
    .delete("/slug/:slug", permissionController.deleteBySlug)

export default permissionRoute;
