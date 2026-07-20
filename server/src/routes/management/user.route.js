import express from 'express';
import userController from '../../controllers/management/user.controller.js';
import userSchema from '../../validators/management/user.validator.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { uploadImageAvatar } from '../../middlewares/fileUpload.middleware.js';
import { verifyToken, checkPermission, isAdmin } from '../../middlewares/verifyToken.middlware.js';
import { logAction } from '../../middlewares/log.middleware.js';
import { createDetails, updateDetails, deleteDetails, fetchEntity } from '../../middlewares/log.helpers.js';
import userService from '../../services/management/user.service.js';

const userRoute = express.Router();

userRoute

    .post("/", verifyToken, checkPermission("them-nguoi-dung"), validate(userSchema.createUser), uploadImageAvatar,
      logAction({ actionType: "CREATE", entityType: "Users", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      userController.createUser)
    .get("/roles", userController.getRolesDropdown)
    .get("/:id", userController.getUserById)
    .get("/", userController.getAllUser)
    .put("/:id", verifyToken, checkPermission("sua-nguoi-dung"), uploadImageAvatar, validate(userSchema.updateUser),
      logAction({ actionType: "UPDATE", entityType: "Users", getOldData: fetchEntity(userService.getUserById), getChanges: updateDetails }),
      userController.updateUser)
    .put('/permissions/:id', verifyToken, isAdmin, userController.updateExtraPermissions)
    .delete("/:id", verifyToken, checkPermission("xoa-nguoi-dung"),
      logAction({ actionType: "DELETE", entityType: "Users", getOldData: fetchEntity(userService.getUserById), getChanges: deleteDetails }),
      userController.deleteUserById)

export default userRoute;
