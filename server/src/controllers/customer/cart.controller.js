import cartService from "../../services/customer/cart.service.js";

const cartController = {
    getCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const cart = await cartService.getOrCreateCart(userId);
            const cartWithItems = await cartService.getCartWithItems(userId);
            return res.status(200).json({
                success: true,
                data: cartWithItems,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi lấy giỏ hàng.",
                error: error.message,
            });
        }
    },

    syncCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { items } = req.body;
            const cart = await cartService.syncCart(userId, items);
            return res.status(200).json({
                success: true,
                message: "Đồng bộ giỏ hàng thành công.",
                data: cart,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi đồng bộ giỏ hàng.",
                error: error.message,
            });
        }
    },
};

export default cartController;
