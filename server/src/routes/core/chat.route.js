import express from "express";
import { verifyTokenOptional } from "../../middlewares/verifyToken.middlware.js";
import { chatController } from "../../controllers/chat/chat.controller.js";

const chatRoute = express.Router();

chatRoute
    .post("/", verifyTokenOptional, chatController.handle);

export default chatRoute;