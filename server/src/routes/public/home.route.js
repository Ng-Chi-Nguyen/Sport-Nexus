import express from 'express';
import { getHomePageController } from '../../controllers/public/public.controller.js';


const publicRoute = express.Router();

publicRoute
    .get("/home", getHomePageController)

export default publicRoute;