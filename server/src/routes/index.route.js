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
import purchaseOrderRoute from "./management/purchaseOrder.route.js";
import roleRoute from "./management/permission.route.js";
import stockMovementRoute from "./management/stockMovement.route.js";
import supplierRoute from "./management/supplier.route.js";
import userRoute from "./management/user.route.js";
import homeRoute from "./web/home.route.js";
import permissionRoute from "./management/permission.route.js";

const Routes = (app) => {

    const api_prefix_v1 = "/api/v1/";

    // Management / Người quản lý - Admin
    app.use(`${api_prefix_v1}management/user/`, userRoute)
    app.use(`${api_prefix_v1}management/supplier/`, supplierRoute)
    app.use(`${api_prefix_v1}management/brand/`, brandRoute)
    app.use(`${api_prefix_v1}management/category/`, categoryRoute)
    app.use(`${api_prefix_v1}management/coupon/`, couponRoute)
    app.use(`${api_prefix_v1}management/stock/`, stockMovementRoute)
    app.use(`${api_prefix_v1}management/purchase-order/`, purchaseOrderRoute)
    app.use(`${api_prefix_v1}management/permission/`, permissionRoute)

    // Customer - Khách hàng
    app.use(`${api_prefix_v1}customer/user-address/`, userAddressRoute)
    app.use(`${api_prefix_v1}customer/cart-item/`, cartItemRoute)
    app.use(`${api_prefix_v1}customer/order/`, orderRoute)
    app.use(`${api_prefix_v1}customer/review/`, reviewRoute)

    // Core - cốt lỗi của hệ thống (Management và Customer)
    app.use(`${api_prefix_v1}core/product/`, productRoute)
    app.use(`${api_prefix_v1}core/product-image/`, productImageRoute)
    app.use(`${api_prefix_v1}core/product-variant/`, productVariantRoute)
    app.use(`${api_prefix_v1}core/variant-attribute-key/`, attriButeKeyRoute)

    // Auth - Xác thực
    app.use(`${api_prefix_v1}auth/`, authRoute)

    // Web - Hiện thì data các trang / Route các trang
    app.use(`${api_prefix_v1}home/`, homeRoute)
}

export default Routes;