import brandRoute from "./management/brand.route.js";
import categoryRoute from "./management/category.route.js";
import couponRoute from "./management/coupon.route.js";
import supplierRoute from "./management/supplier.route.js";
import userRoute from "./management/user.route.js";
import publicRoute from "./public/home.route.js";

const Routes = (app) => {

    app.use("/api/v1/public/", publicRoute)
    app.use("/api/v1/managament/user/", userRoute)
    app.use("/api/v1/managament/supplier/", supplierRoute)
    app.use("/api/v1/managament/brand/", brandRoute)
    app.use("/api/v1/managament/category/", categoryRoute)
    app.use("/api/v1/managament/coupon/", couponRoute)
}

export default Routes;