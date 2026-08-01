import authRoute from "./auth/auth.route.js";
import attriButeKeyRoute from "./core/attributekey.route.js";
import productRoute from "./core/product.route.js";
import productImageRoute from "./core/productImage.route.js";
import productVariantRoute from "./core/productvariants.route.js";
import cartItemRoute from "./customer/cartItem.route.js";
import orderRoute from "./customer/order.route.js";
import reviewRoute from "./customer/review.route.js";
import userAddressRoute from "./customer/useraddresses.route.js";
import brandRoute from "./management/brand.route.js";
import categoryRoute from "./management/category.route.js";
import couponRoute from "./management/coupon.route.js";
import dashboardRoute from "./management/dashboard.route.js";
import purchaseOrderRoute from "./management/purchaseOrder.route.js";
import roleRoute from "./management/permission.route.js";
import stockMovementRoute from "./management/stockMovement.route.js";
import supplierRoute from "./management/supplier.route.js";
import userRoute from "./management/user.route.js";
import homeRoute from "./web/home.route.js";
import webProductRoute from "./web/product.route.js";
import webCouponRoute from "./web/coupon.route.js";
import permissionRoute from "./management/permission.route.js";
import logRoute from "./management/log.route.js";
import productAttributeKeyRoute from "./management/productAttributeKey.route.js";
import cartRoute from "./customer/cart.route.js";
import customerUserRoute from "./customer/user.route.js";
import sendEmailRoute from "./email/sendEmail.route.js";
import paymentRoute from "./customer/payment.route.js";

const Routes = (app) => {

    const api_prefix_v1 = "/api/v1/";

    // Management / Ng�?i qu?n l? - Admin
    app.use(`${api_prefix_v1}management/user/`, userRoute)
    app.use(`${api_prefix_v1}management/supplier/`, supplierRoute)
    app.use(`${api_prefix_v1}management/brand/`, brandRoute)
    app.use(`${api_prefix_v1}management/category/`, categoryRoute)
    app.use(`${api_prefix_v1}management/coupon/`, couponRoute)
    app.use(`${api_prefix_v1}management/stock/`, stockMovementRoute)
    app.use(`${api_prefix_v1}management/purchase-order/`, purchaseOrderRoute)
    app.use(`${api_prefix_v1}management/permission/`, permissionRoute)
    app.use(`${api_prefix_v1}management/log/`, logRoute)
    app.use(`${api_prefix_v1}management/dashboard/`, dashboardRoute)
    app.use(`${api_prefix_v1}management/product-attribute-key/`, productAttributeKeyRoute)

    // Customer - Kh�ch h�ng
    app.use(`${api_prefix_v1}user/`, customerUserRoute)
    app.use(`${api_prefix_v1}customer/user-address/`, userAddressRoute)
    app.use(`${api_prefix_v1}customer/cart-item/`, cartItemRoute)
    app.use(`${api_prefix_v1}customer/cart/`, cartRoute)
    app.use(`${api_prefix_v1}customer/order/`, orderRoute)
    app.use(`${api_prefix_v1}customer/review/`, reviewRoute)
    app.use(`${api_prefix_v1}customer/payment/`, paymentRoute)

    // Core - c?t l?i c?a h? th?ng (Management v� Customer)
    app.use(`${api_prefix_v1}core/product/`, productRoute)
    app.use(`${api_prefix_v1}core/product-image/`, productImageRoute)
    app.use(`${api_prefix_v1}core/product-variant/`, productVariantRoute)
    app.use(`${api_prefix_v1}core/variant-attribute-key/`, attriButeKeyRoute)

    // Auth - X�c th?c
    app.use(`${api_prefix_v1}auth/`, authRoute)

    // Web - Hi?n th? data c�c trang / Route c�c trang
    app.use(`${api_prefix_v1}home/`, homeRoute)
    app.use(`${api_prefix_v1}home/product/`, webProductRoute)
    app.use(`${api_prefix_v1}home/coupon/`, webCouponRoute)

    // Send Email
    app.use(`${api_prefix_v1}email/`, sendEmailRoute)
}

export default Routes;
