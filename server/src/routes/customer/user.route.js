import express from 'express';
import customerUserController from '../../controllers/customer/user.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.middlware.js';
import { uploadImageAvatar } from '../../middlewares/fileUpload.middleware.js';

const customerUserRoute = express.Router();

customerUserRoute
    .get("/profile", verifyToken, customerUserController.getProfile)
    .put("/profile", verifyToken, customerUserController.updateProfile)
    .post("/upload-avatar", verifyToken, uploadImageAvatar, customerUserController.uploadAvatar);

export default customerUserRoute;
