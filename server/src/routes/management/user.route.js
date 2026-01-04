import express from 'express';
import userController from '../../controllers/management/user.controller.js';
import userSchema from '../../validators/management/user.validator.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { uploadImageAvatar } from '../../middlewares/fileUpload.middleware.js';
import { verifyToken } from '../../middlewares/verifyToken.middlware.js';
import { checkPermission } from '../../middlewares/auth.middleware.js';

const userRoute = express.Router();

userRoute

    .post("/", verifyToken, checkPermission("them-nguoi-dung"), validate(userSchema.createUser), uploadImageAvatar, userController.createUser)
    .get("/:id", userController.getUserById)
    .get("/", userController.getAllUser)
    .put("/:id", verifyToken, checkPermission("sua-nguoi-dung"), uploadImageAvatar, validate(userSchema.updateUser), userController.updateUser)
    .put('/permissions/:id', userController.updateExtraPermissions)
    .delete("/:id", userController.deleteUserById)

export default userRoute;