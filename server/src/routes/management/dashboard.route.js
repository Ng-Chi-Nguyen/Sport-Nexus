import express from 'express';
import dashboardController from '../../controllers/management/dashboard.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/verifyToken.middlware.js';

const dashboardRoute = express.Router();

dashboardRoute.get('/business-overview', verifyToken, isAdmin, dashboardController.getBusinessOverview);
dashboardRoute.get('/customer-overview', verifyToken, isAdmin, dashboardController.getCustomerOverview);
dashboardRoute.get('/product-overview', verifyToken, isAdmin, dashboardController.getProductOverview);
dashboardRoute.get('/coupon-overview', verifyToken, isAdmin, dashboardController.getCouponOverview);
dashboardRoute.get('/supplier-overview', verifyToken, isAdmin, dashboardController.getSupplierOverview);
dashboardRoute.get('/review-overview', verifyToken, isAdmin, dashboardController.getReviewOverview);
dashboardRoute.get('/system-overview', verifyToken, isAdmin, dashboardController.getSystemOverview);
dashboardRoute.get('/order-overview', verifyToken, isAdmin, dashboardController.getOrderOverview);
dashboardRoute.get('/inventory-overview', verifyToken, isAdmin, dashboardController.getInventoryOverview);

export default dashboardRoute;
