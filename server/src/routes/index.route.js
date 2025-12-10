import supplierRoute from "./management/supplier.route.js";
import userRoute from "./management/user.route.js";
import publicRoute from "./public/home.route.js";

const Routes = (app) => {
    app.use("/api/v1/public/", publicRoute)
    app.use("/api/v1/managament/user/", userRoute)
    app.use("/api/v1/managament/supplier/", supplierRoute)
}

export default Routes;