import Joi from "Joi";

const orderSchema = {
    createOrder: Joi.object({
        total_amount: Joi.number().precision(2).min(0).required().messages({
            'number.base': 'Tổng tiền phải là một số',
            'number.min': 'Tổng tiền không được nhỏ hơn 0',
        }),

        status: Joi.string().valid('Processing', 'Shipping', 'Delivered', 'Cancelled', 'Refunded').default('Processing'),

        shipping_address: Joi.string().required().messages({
            'any.required': 'Địa chỉ giao hàng là bắt buộc',
        }),

        payment_method: Joi.string().valid('COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY').required().messages({
            'any.only': 'Phương thức thanh toán không hợp lệ',
        }),

        payment_status: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded').default('Pending'),

        discount_amount: Joi.number().precision(2).default(0),
        final_amount: Joi.number().precision(2).min(0).required(),

        coupon_code: Joi.string().allow(null).default(null),
        user_email: Joi.string().required(),
        items: Joi.array().items(
            Joi.object({
                product_variant_id: Joi.number().integer().required().messages({
                    'any.required': 'ID biến thể sản phẩm là bắt buộc'
                }),
                quantity: Joi.number().integer().min(1).required().messages({
                    'number.min': 'Số lượng phải ít nhất là 1'
                }),
                price_at_purchase: Joi.number().min(0).required()
            })
        ).min(1).required().messages({
            'array.min': 'Đơn hàng phải có ít nhất một sản phẩm'
        })
    }),

    updateOrder: Joi.object({
        total_amount: Joi.number().precision(2).min(0).messages({
            'number.base': 'Tổng tiền phải là một số',
            'number.min': 'Tổng tiền không được nhỏ hơn 0',
        }),

        status: Joi.string().valid('Processing', 'Shipping', 'Delivered', 'Cancelled', 'Refunded').default('Processing'),

        shipping_address: Joi.string(),

        payment_method: Joi.string().valid('COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY').messages({
            'any.only': 'Phương thức thanh toán không hợp lệ',
        }),

        payment_status: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded').default('Pending'),

        discount_amount: Joi.number().precision(2).min(0).default(0),
        final_amount: Joi.number().precision(2).min(0),

        // coupon_code: Joi.string().allow(null).default(null),
        user_email: Joi.string(),
        items: Joi.array().items(
            Joi.object({
                product_variant_id: Joi.number().integer().messages({
                    'any.required': 'ID biến thể sản phẩm là bắt buộc'
                }),
                quantity: Joi.number().integer().min(1).messages({
                    'number.min': 'Số lượng phải ít nhất là 1'
                }),
                price_at_purchase: Joi.number().min(0)
            })
        ).min(1).messages({
            'array.min': 'Đơn hàng phải có ít nhất một sản phẩm'
        })
    }),
}

export default orderSchema;