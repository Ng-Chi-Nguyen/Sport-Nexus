import orderService from "../../services/customer/order.service.js";
import emailService from "../../services/email/email.service.js";

const PAYMENT_LABELS = {
    COD: "Thanh toán khi nhận hàng",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    MOMO: "Ví MoMo",
    VNPAY: "VNPay",
    CREDIT_CARD: "Thẻ tín dụng",
};

const STATUS_LABELS = {
    Processing: "Chuẩn bị hàng",
    Shipping: "Đang giao",
    Delivered: "Đã giao",
    Cancelled: "Đã hủy",
    Refunded: "Hoàn tiền",
};

const PAYMENT_STATUS_LABELS = {
    Pending: "Chờ thanh toán",
    Paid: "Đã thanh toán",
    Failed: "Thất bại",
    Refunded: "Hoàn tiền",
};

const orderController = {
    createOrder: async (req, res) => {
        let orderData = req.body;
        // console.log(orderData)
        try {
            let newOrder = await orderService.createOrder(orderData);
            let emailResult = null;

            if (orderData.user_email) {
                // console.log("email: ", orderData.user_email)
                try {
                    // console.log("OK")
                    emailResult = await emailService.sendOrderConfirmationEmail(
                        orderData.user_email,
                        orderData.user_name || "Khách hàng",
                        newOrder,
                        newOrder.OrderItems || [],
                        PAYMENT_LABELS[orderData.payment_method] || orderData.payment_method,
                        STATUS_LABELS[newOrder.status] || newOrder.status,
                        PAYMENT_STATUS_LABELS[newOrder.payment_status] || newOrder.payment_status,
                    );
                    console.log(`Email xác nhận đã gửi đến ${orderData.user_email}`);
                } catch (emailErr) {
                    console.error(`Gửi email thất bại:`, emailErr.message);
                }
            }
            // console.log("Hoàn thânhf")
            return res.status(201).json({
                success: true,
                message: "Đơn hàng đã được tạo.",
                data: newOrder,
                email_sent: !!emailResult,
            })
        } catch (error) {
            const status = error.code === 'INSUFFICIENT_STOCK' ? 400 : 500;
            return res.status(status).json({
                success: false,
                message: error.message || "Lỗi server nội bộ.",
            })
        }
    },

    getOrderItems: async (req, res) => {
        let orderId = parseInt(req.params.id);
        try {
            let items = await orderService.getOrderItemsById(orderId);

            if (!items || items.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Đơn hàng này không có sản phẩm."
                });
            }

            return res.status(200).json({
                success: true,
                data: items
            })
        } catch (error) {
            const status = error.code === 'INSUFFICIENT_STOCK' ? 400 : 500;
            return res.status(status).json({
                success: false,
                message: error.message || "Lỗi server nội bộ.",
            })
        }
    },

    getOrderById: async (req, res) => {
        let orderId = parseInt(req.params.id)
        // console.log("SERVER ĐÃ VÀO ĐÂY")
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

    getOrderDropdown: async (req, res) => {
        // console.log("Đã đi vô đây 3")
        try {
            let list_orders = await orderService.getOrderDropdown();

            if (!list_orders || list_orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

            return res.status(200).json({
                success: true,
                data: list_orders
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    },


    getAllOrders: async (req, res) => {
        const page = parseInt(req.query.page || 1);
        const status = req.query.status || '';
        const payment_status = req.query.payment_status || '';
        const payment_method = req.query.payment_method || '';
        const date_from = req.query.date_from || '';
        const date_to = req.query.date_to || '';
        const amount_min = req.query.amount_min || '';
        const amount_max = req.query.amount_max || '';
        const search = req.query.search || '';
        try {
            let result = await orderService.getAllOrders({ page, status, payment_status, payment_method, date_from, date_to, amount_min, amount_max, search });
            if (!result || result.orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không có đơn hàng nào."
                });
            }
            return res.status(200).json({
                success: true,
                data: result
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
        try {
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Danh sách sản phẩm (items) không được để trống khi cập nhật."
                });
            }

            const oldOrder = await orderService.getOrderById(orderId);
            if (!oldOrder) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng.",
                });
            }

            let updatedOrder = await orderService.updateOrder(orderId, dataUpdate, items);

            if (oldOrder.status !== updatedOrder.status) {
                if (updatedOrder.user_email) {
                    console.log(`[EMAIL] Đang gửi email cập nhật trạng thái (${oldOrder.status} → ${updatedOrder.status}) đến ${updatedOrder.user_email}...`);
                    emailService.sendOrderStatusUpdateEmail(
                        updatedOrder.user_email,
                        updatedOrder.user_email || "Khách hàng",
                        updatedOrder,
                        STATUS_LABELS[oldOrder.status] || oldOrder.status,
                        STATUS_LABELS[updatedOrder.status] || updatedOrder.status,
                        PAYMENT_LABELS[updatedOrder.payment_method] || updatedOrder.payment_method,
                        PAYMENT_STATUS_LABELS[updatedOrder.payment_status] || updatedOrder.payment_status,
                    ).then(() => {
                        console.log(`[EMAIL] Gửi email cập nhật trạng thái thành công đến ${updatedOrder.user_email}`);
                    }).catch((err) => {
                        console.error(`[EMAIL] Gửi email cập nhật trạng thái thất bại:`, err);
                    });
                } else {
                    console.log(`[EMAIL] Bỏ qua gửi email cập nhật - không có user_email trong đơn hàng #${updatedOrder.id}`);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Cập nhật đơn hàng thành công",
                data: updatedOrder
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