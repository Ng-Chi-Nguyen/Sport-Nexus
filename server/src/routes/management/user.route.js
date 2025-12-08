import express from 'express';
import userController from '../../controllers/management/user.controller.js';
import userSchema from '../../validators/management/user.validator.js';
import { validate } from '../../middlewares/validation.middleware.js';

const userRoute = express.Router();

userRoute 
    .post("/", validate(userSchema.createUser), userController.createUser)
    .put("/:id", validate(userSchema.updateUser), userController.updateUser)

export default userRoute;