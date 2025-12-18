import { empty } from "@prisma/client/runtime/library";
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
        let cartItemId = parseInt(req.params.id);
        try {
            let cartItem = await cartItemService.getCartItemById(cartItemId);

            if (!cartItems || cartItems.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }

            return res.status(200).json({
                success: true,
                data: cartItem
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình lấy sản phẩm trong giỏ hàng.",
                error: error.message
            })
        }
    },

    getCartItemByCartId: async (req, res) => {
        let cartId = parseInt(req.params.id);
        try {
            let cartItems = await cartItemService.getCartItemByCartId(cartId);

            if (!cartItems || cartItems.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }

            return res.status(200).json({
                success: true,
                data: cartItems,
            })
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
        let cartItemId = parseInt(req.params.id)
        try {
            let updateCartItem = await cartItemService.updateCartItem(cartItemId, cartItemData);
            return res.status(200).json({
                success: true,
                data: updateCartItem,
            })
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm trong giỏ hàng.",
                })
            }

            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình chỉnh sửa sản phẩm trong giỏ hàng.",
                error: error.message,
                code: error.code
            })
        }
    },

    deleteCartItem: async (req, res) => {
        let cartItemId = parseInt(req.params.id)
        try {
            await cartItemService.deleteCartItem(cartItemId);
            return res.status(200).json({
                success: true,
                message: "Sản phẩm đã được xóa khỏi giỏ hàng",
            })
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm trong giỏ hàng.",
                })
            }

            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình xóa sản phẩm khỏi giỏ hàng.",
                error: error.message
            })
        }
    }
}

export default cartItemController;