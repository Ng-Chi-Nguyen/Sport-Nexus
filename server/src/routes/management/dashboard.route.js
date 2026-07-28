import express from 'express';
import dashboardController from '../../controllers/management/dashboard.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/verifyToken.middlware.js';

const dashboardRoute = express.Router();

dashboardRoute.get('/business-overview', verifyToken, isAdmin, dashboardController.getBusinessOverview);
dashboardRoute.get('/customer-overview', verifyToken, isAdmin, dashboardController.getCustomerOverview);

export default dashboardRoute;
