import orderService from "../../services/customer/order.service.js";

const orderController = {
    createOrder: async (req, res) => {
        let orderData = req.body;
        // console.log(orderData)
        try {
            let newOrder = await orderService.createOrder(orderData);
            return res.status(201).json({
                success: true,
                message: "Đơn hàng đã được tạo.",
                data: newOrder
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    getOrderById: async (req, res) => {
        let orderId = parseInt(req.params.id)
        try {
            let order = await orderService.getOrderById(orderId);

            if (!order || order.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng."
                });
            }

            return res.status(200).json({
                success: true,
                data: order
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    getOrderByEmail: async (req, res) => {
        let email = req.params.email;

        if (!email) {
            return res.status(400).json({ success: false, message: "Thiếu email" });
        }

        try {
            let orders = await orderService.getOrderByEmail(email);
            if (!orders || orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: orders
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    getOrderByCode: async (req, res) => {
        let code = req.params.code;
        try {
            let orders = await orderService.getOrderByCode(code);
            if (!orders || orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: orders
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    getAllOrders: async (req, res) => {
        const page = parseInt(req.query.page || 1)
        try {
            let orders = await orderService.getAllOrders(page);
            if (!orders || orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không có đơn hàng nào."
                });
            }
            return res.status(200).json({
                success: true,
                data: orders
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    updateOrder: async (req, res) => {
        const { items, ...dataUpdate } = req.body;
        let orderId = parseInt(req.params.id);
        // console.log(orderId)
        try {
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Danh sách sản phẩm (items) không được để trống khi cập nhật."
                });
            }
            let updateOrder = await orderService.updateOrder(orderId, dataUpdate, items);
            return res.status(200).json({
                success: true,
                message: "Cập nhật đơn hàng thành công",
                data: updateOrder
            })
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng.",
                })
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    deleteOrder: async (req, res) => {
        let orderId = parseInt(req.params.id);
        try {
            await orderService.deleteOrder(orderId);
            return res.status(200).json({
                success: true,
                message: "Xóa đơn hàng thành công"
            })
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng.",
                })
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    }
}

export default orderController;