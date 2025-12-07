import express from 'express';
import { createUserController } from '../../controllers/management/user.controller.js';
import { createUserSchema } from '../../validators/management/user.validator.js';
import { validate } from '../../middlewares/validation.middleware.js';

const userRoute = express.Router();

userRoute 
    .post("/", validate(createUserSchema), createUserController)

export default userRoute;