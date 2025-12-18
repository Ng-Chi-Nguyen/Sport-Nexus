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

            if (!address || address.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy địa chỉ của bạn."
                });
            }
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

            if (!address || address.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy địa chỉ của bạn."
                });
            }

            return res.status(200).json({
                success: true,
                data: address
            })
        } catch (error) {

            if (error.code === '409') {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    updateUserAddress: async (req, res) => {
        let dataUpdate = req.body;
        let addressId = parseInt(req.params.id);

        try {
            let updateData = await userAddressService.updateUserAddress(addressId, dataUpdate);
            return res.status(200).json({
                success: true,
                message: "Địa chỉ đã được cập nhật",
                data: updateData
            })
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy địa chỉ của bạn.",
                })
            }

            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    deleteUserAddress: async (req, res) => {
        let addressId = parseInt(req.params.id);

        try {
            await userAddressService.deleteUserAddress(addressId);
            return res.status(200).json({
                success: true,
                message: "Địa chỉ đã được xóa",
            })
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy địa chỉ của bạn.",
                })
            }

            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

}

export default userAddressController;