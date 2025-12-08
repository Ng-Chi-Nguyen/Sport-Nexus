import express from 'express';
import userController from '../../controllers/management/user.controller.js';
import userSchema from '../../validators/management/user.validator.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { uploadImage } from '../../middlewares/fileUpload.middleware.js';

const userRoute = express.Router();

userRoute
    .post("/", validate(userSchema.createUser), userController.createUser)
    .get("/:id", userController.getUserById)
    .get("/", userController.getAllUser)
    .put("/:id", validate(userSchema.updateUser), uploadImage, userController.updateUser)
    .delete("/:id", userController.deleteUserById)

export default userRoute;