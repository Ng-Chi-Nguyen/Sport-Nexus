import express from "express";
import collectionController from "../../controllers/web/collection.controller.js";

const webCollectionRoute = express.Router();

webCollectionRoute
    .get("/", collectionController.getCollections)
    .get("/slug/:slug", collectionController.getCollectionBySlug);

export default webCollectionRoute;
