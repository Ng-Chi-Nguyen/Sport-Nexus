import express from 'express';
import dashboardController from '../../controllers/management/dashboard.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/verifyToken.middlware.js';

const dashboardRoute = express.Router()

dashboardRoute

    .get('/business-overview', dashboardController.getBusinessOverview)
    .get('/customer-overview', dashboardController.getCustomerOverview)
    .get('/product-overview', dashboardController.getProductOverview)
    .get('/coupon-overview', dashboardController.getCouponOverview)
    .get('/supplier-overview', dashboardController.getSupplierOverview)
    .get('/review-overview', dashboardController.getReviewOverview)
    .get('/system-overview', dashboardController.getSystemOverview)
    .get('/order-overview', dashboardController.getOrderOverview)
    .get('/inventory-overview', dashboardController.getInventoryOverview)
    .get('/export', verifyToken, isAdmin, dashboardController.exportOverview)
// .get('/business-overview', verifyToken, isAdmin, dashboardController.getBusinessOverview)
// .get('/customer-overview', verifyToken, isAdmin, dashboardController.getCustomerOverview)
// .get('/product-overview', verifyToken, isAdmin, dashboardController.getProductOverview)
// .get('/coupon-overview', verifyToken, isAdmin, dashboardController.getCouponOverview)
// .get('/supplier-overview', verifyToken, isAdmin, dashboardController.getSupplierOverview)
// .get('/review-overview', verifyToken, isAdmin, dashboardController.getReviewOverview)
// .get('/system-overview', verifyToken, isAdmin, dashboardController.getSystemOverview)
// .get('/order-overview', verifyToken, isAdmin, dashboardController.getOrderOverview)
// .get('/inventory-overview', verifyToken, isAdmin, dashboardController.getInventoryOverview)

export default dashboardRoute;
