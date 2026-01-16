import Joi from "Joi";

const purchaseOrderSchema = {
    createPurchaseOrder: Joi.object({
        // 1. Thông tin đơn hàng (Purchase Order)
        supplier_id: Joi.number().integer().required().messages({
            'number.base': 'ID nhà cung cấp phải là số',
            'any.required': 'Nhà cung cấp là bắt buộc'
        }),
        expected_delivery_date: Joi.date().greater('now').required().messages({
            'date.base': 'Định dạng ngày không hợp lệ',
            'date.greater': 'Ngày giao hàng dự kiến phải sau ngày hiện tại',
            'any.required': 'Ngày giao hàng dự kiến là bắt buộc'
        }),
        total_cost: Joi.number().min(0).required().messages({
            'number.min': 'Tổng chi phí không được âm'
        }),

        status: Joi.string().valid('PENDING', 'RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED').default('PENDING'),

        // 2. Danh sách mặt hàng (Purchase Order Items)
        items: Joi.array().items(
            Joi.object({
                product_variant_id: Joi.number().integer().required().messages({
                    'any.required': 'ID biến thể sản phẩm là bắt buộc'
                }),
                quantity: Joi.number().integer().min(1).required().messages({
                    'number.min': 'Số lượng nhập ít nhất phải là 1',
                    'any.required': 'Số lượng là bắt buộc'
                }),
                unit_cost_price: Joi.number().min(0).required().messages({
                    'number.min': 'Giá nhập không được âm',
                    'any.required': 'Giá nhập là bắt buộc'
                }),
                // quantity_received: Joi.number().integer().min(0).default(0)
            })
        ).min(1).required().messages({
            'array.min': 'Đơn nhập hàng phải có ít nhất một mặt hàng',
            'any.required': 'Danh sách mặt hàng là bắt buộc'
        })
    }),

    updatePurchaseOrder: Joi.object({
        // 1. Thông tin chung (Tất cả đều là optional vì có thể chỉ cập nhật 1 trường)
        supplier_id: Joi.number().integer(),

        expected_delivery_date: Joi.date().greater('now').messages({
            'date.greater': 'Ngày giao hàng mới phải sau thời điểm hiện tại'
        }),

        status: Joi.string().valid('PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED').messages({
            'any.only': 'Trạng thái phải là một trong: Pending, Processing, Received, Cancelled'
        }),

        total_cost: Joi.number().min(0),

        // 2. Cập nhật danh sách mặt hàng (Nếu gửi lên thì sẽ thay thế hoặc cập nhật)
        items: Joi.array().items(
            Joi.object({
                id: Joi.number().integer().optional(), // ID của dòng item cũ (nếu muốn update dòng cũ)
                product_variant_id: Joi.number().integer().required(),
                quantity: Joi.number().integer().min(1).required(),
                unit_cost_price: Joi.number().min(0).required(),
                quantity_received: Joi.number().integer().min(0)
            })
        ).min(1)
    })
}

export default purchaseOrderSchema;