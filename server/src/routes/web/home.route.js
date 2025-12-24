import express from "express";
import homeController from "../../controllers/web/home.controller.js";

const homeRoute = express.Router();

homeRoute

    .get("/", homeController.getHomePageData)

export default homeRoute;