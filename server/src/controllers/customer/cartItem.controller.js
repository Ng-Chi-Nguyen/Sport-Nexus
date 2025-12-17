import cartItemService from "../../services/customer/cartItem.service.js";

const cartItemController = {
    createCartItem: async (req, res) => {
        let cartItemData = req.body;
        try {
            let newCartItem = await cartItemService.createCartItem(cartItemData);
            return res.status(201).json({
                success: true,
                message: "Sản phẩm đã được thêm vào giỏ hàng.",
                data: newCartItem
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình thêm sản phẩm vào giỏ hàng.",
                error: error.message
            })
        }
    },

    getCartItemById: async (req, res) => {
        let cartItemData = req.body;
        try {

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình lấy sản phẩm trong giỏ hàng.",
                error: error.message
            })
        }
    },

    getCartItemByUserId: async (req, res) => {
        let cartItemData = req.body;
        try {

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình lấy sản phẩm trong giỏ hàng.",
                error: error.message
            })
        }
    },

    updateCartItem: async (req, res) => {
        let cartItemData = req.body;
        try {

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình chỉnh sửa sản phẩm trong giỏ hàng.",
                error: error.message
            })
        }
    },

    deleteCartItem: async (req, res) => {
        let cartItemData = req.body;
        try {

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình xóa sản phẩm khỏi giỏ hàng.",
                error: error.message
            })
        }
    }
}

export default cartItemController;