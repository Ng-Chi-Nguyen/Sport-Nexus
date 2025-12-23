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
import stockMovementRoute from "./management/stockMovement.route.js";
import supplierRoute from "./management/supplier.route.js";
import userRoute from "./management/user.route.js";

const Routes = (app) => {

    const api_prefix_v1 = "/api/v1/";

    // Management / Người quản lý - Admin
    app.use(`${api_prefix_v1}managament/user/`, userRoute)
    app.use(`${api_prefix_v1}managament/supplier/`, supplierRoute)
    app.use(`${api_prefix_v1}managament/brand/`, brandRoute)
    app.use(`${api_prefix_v1}managament/category/`, categoryRoute)
    app.use(`${api_prefix_v1}managament/coupon/`, couponRoute)
    app.use(`${api_prefix_v1}managament/stock/`, stockMovementRoute)
    app.use(`${api_prefix_v1}managament/purchase-order/`, purchaseOrderRoute)

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
}

export default Routes;