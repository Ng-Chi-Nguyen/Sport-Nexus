import publicRoute from "./public/home.route.js";



const Routes = (app) => {
    app.use("/api/v1/public/", publicRoute)
}

export default Routes;