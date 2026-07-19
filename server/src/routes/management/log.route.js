import express from "express";
import logController from "../../controllers/management/log.controller.js";
import { verifyToken, isAdmin } from "../../middlewares/verifyToken.middlware.js";

const logRoute = express.Router();

logRoute
  .get("/", verifyToken, isAdmin, logController.getAll)
  .get("/:id", verifyToken, isAdmin, logController.getById);

export default logRoute;
