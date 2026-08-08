import authRoute from "./auth/auth.route.js";
import attriButeKeyRoute from "./core/attributekey.route.js";
import productRoute from "./core/product.route.js";
import productImageRoute from "./core/productImage.route.js";
import productVariantRoute from "./core/productvariants.route.js";
import cartItemRoute from "./customer/cartItem.route.js";
import orderRoute from "./customer/order.route.js";
import customerInvoiceRoute from "./customer/invoice.route.js";
import reviewRoute from "./customer/review.route.js";
import userAddressRoute from "./customer/useraddresses.route.js";
import brandRoute from "./management/brand.route.js";
import categoryRoute from "./management/category.route.js";
import collectionRoute from "./management/collection.route.js";
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
import webCollectionRoute from "./web/collection.route.js";
import permissionRoute from "./management/permission.route.js";
import logRoute from "./management/log.route.js";
import productAttributeKeyRoute from "./management/productAttributeKey.route.js";
import invoiceRoute from "./management/invoice.route.js";
import cartRoute from "./customer/cart.route.js";
import customerUserRoute from "./customer/user.route.js";
import sendEmailRoute from "./email/sendEmail.route.js";
import paymentRoute from "./customer/payment.route.js";
import managementPaymentRoute from "./management/payment.route.js";
import customerCouponRoute from "./customer/coupon.route.js";
import customerShippingRoute from "./customer/shipping.route.js";
import loyaltyCustomerRoute from "./customer/loyalty.route.js";
import managementShippingRoute from "./management/shipping.route.js";
import loyaltyManagementRoute from "./management/loyalty.route.js";
import chatRoute from "./core/chat.route.js";

const Routes = (app) => {

    const api_prefix_v1 = "/api/v1/";

    // Management / Ngườii quản lý - Admin
    app.use(`${api_prefix_v1}management/user/`, userRoute)
    app.use(`${api_prefix_v1}management/supplier/`, supplierRoute)
    app.use(`${api_prefix_v1}management/brand/`, brandRoute)
    app.use(`${api_prefix_v1}management/category/`, categoryRoute)
    app.use(`${api_prefix_v1}management/collection/`, collectionRoute)
    app.use(`${api_prefix_v1}management/coupon/`, couponRoute)
    app.use(`${api_prefix_v1}management/stock/`, stockMovementRoute)
    app.use(`${api_prefix_v1}management/purchase-order/`, purchaseOrderRoute)
    app.use(`${api_prefix_v1}management/permission/`, permissionRoute)
    app.use(`${api_prefix_v1}management/log/`, logRoute)
    app.use(`${api_prefix_v1}management/dashboard/`, dashboardRoute)
    app.use(`${api_prefix_v1}management/product-attribute-key/`, productAttributeKeyRoute)
    app.use(`${api_prefix_v1}management/invoice/`, invoiceRoute)
    app.use(`${api_prefix_v1}management/payment/`, managementPaymentRoute)
    app.use(`${api_prefix_v1}management/shipping/`, managementShippingRoute)
    app.use(`${api_prefix_v1}management/loyalty/`, loyaltyManagementRoute)

    // Customer - Khách hàng
    app.use(`${api_prefix_v1}user/`, customerUserRoute)
    app.use(`${api_prefix_v1}customer/user-address/`, userAddressRoute)
    app.use(`${api_prefix_v1}customer/cart-item/`, cartItemRoute)
    app.use(`${api_prefix_v1}customer/cart/`, cartRoute)
    app.use(`${api_prefix_v1}customer/order/`, orderRoute)
    app.use(`${api_prefix_v1}customer/coupon/`, customerCouponRoute)
    app.use(`${api_prefix_v1}customer/invoice/`, customerInvoiceRoute)
    app.use(`${api_prefix_v1}customer/review/`, reviewRoute)
    app.use(`${api_prefix_v1}customer/payment/`, paymentRoute)
    app.use(`${api_prefix_v1}customer/shipping/`, customerShippingRoute)
    app.use(`${api_prefix_v1}customer/loyalty/`, loyaltyCustomerRoute)

    // Core - cat lai của hệ thống (Management vs Customer)
    app.use(`${api_prefix_v1}core/product/`, productRoute)
    app.use(`${api_prefix_v1}core/product-image/`, productImageRoute)
    app.use(`${api_prefix_v1}core/product-variant/`, productVariantRoute)
    app.use(`${api_prefix_v1}core/variant-attribute-key/`, attriButeKeyRoute)
    app.use(`${api_prefix_v1}chat/`, chatRoute);

    // Auth - Xác th?c
    app.use(`${api_prefix_v1}auth/`, authRoute)

    // Web - Hien thi data cac trang / Route cac trang
    app.use(`${api_prefix_v1}home/`, homeRoute)
    app.use(`${api_prefix_v1}home/product/`, webProductRoute)
    app.use(`${api_prefix_v1}home/coupon/`, webCouponRoute)
    app.use(`${api_prefix_v1}home/collection/`, webCollectionRoute)

    // Send Email
    app.use(`${api_prefix_v1}email/`, sendEmailRoute)
}

export default Routes;
