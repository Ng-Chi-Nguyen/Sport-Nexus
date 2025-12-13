import userAddressService from "../../services/customer/userAddresses.service.js";

const userAddressController = {
    createUserAddress: async (req, res) => {
        let userAddressData = req.body;
        try {
            let newUserAddress = await userAddressService.createUserAddress(userAddressData)
            return res.status(201).json({
                success: true,
                message: "Địa chỉ đã được thêm",
                data: newUserAddress
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getUserAddressId: async (req, res) => {
        let addressId = parseInt(req.params.id);
        try {
            let address = await userAddressService.getUserAddressId(addressId);
            return res.status(200).json({
                success: true,
                data: address
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getUserAddressByUserId: async (req, res) => {
        let userId = parseInt(req.params.userId);
        try {
            let address = await userAddressService.getUserAddressByUserId(userId);
            return res.status(200).json({
                success: true,
                data: address
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

}

export default userAddressController;