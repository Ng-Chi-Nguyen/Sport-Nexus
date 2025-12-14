import userAddressRoute from "./customer/useraddresses.route.js";
import brandRoute from "./management/brand.route.js";
import categoryRoute from "./management/category.route.js";
import couponRoute from "./management/coupon.route.js";
import supplierRoute from "./management/supplier.route.js";
import userRoute from "./management/user.route.js";

const Routes = (app) => {

    // Management / Người quản lý - Admin
    app.use("/api/v1/managament/user/", userRoute)
    app.use("/api/v1/managament/supplier/", supplierRoute)
    app.use("/api/v1/managament/brand/", brandRoute)
    app.use("/api/v1/managament/category/", categoryRoute)
    app.use("/api/v1/managament/coupon/", couponRoute)

    // Customer - Khách hàng
    app.use("/api/v1/customer/user-address/", userAddressRoute)
}

export default Routes;