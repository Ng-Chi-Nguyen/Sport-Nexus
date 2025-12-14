import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import userAddressSchema from "../../validators/customer/userAddress.validator.js";
import userAddressController from "../../controllers/customer/useraddresses.controller.js";

const userAddressRoute = express.Router();

userAddressRoute

    .post("/", validate(userAddressSchema.createUserAddress), userAddressController.createUserAddress)
    .get("/:id", userAddressController.getUserAddressId)
    .get("/user/:userId", userAddressController.getUserAddressByUserId)
    .put("/:id", validate(userAddressSchema.updateUserAddress), userAddressController.updateUserAddress)
    .delete("/:id", userAddressController.deleteUserAddress)

export default userAddressRoute;