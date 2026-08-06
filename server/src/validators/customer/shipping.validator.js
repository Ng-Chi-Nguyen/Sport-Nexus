import Joi from "Joi";

const shippingSchema = {
    calculate: Joi.object({
        province_name: Joi.string().allow("").default(""),
        weight_grams: Joi.number().integer().min(1).max(50000).default(500).messages({
            'number.min': 'Cân nặng tối thiểu 1 gram',
        }),
        service_type: Joi.string().valid('FAST', 'ECONOMY').default('FAST'),
        cod_amount: Joi.number().min(0).default(0),
        item_value: Joi.number().min(0).default(0),
    }),

    create: Joi.object({
        order_id: Joi.number().integer().required().messages({
            'any.required': 'order_id là bắt buộc',
        }),
        recipient_name: Joi.string().trim().required().messages({
            'any.required': 'Tên người nhận là bắt buộc',
        }),
        recipient_phone: Joi.string().trim().required().messages({
            'any.required': 'Số điện thoại người nhận là bắt buộc',
        }),
        province_name: Joi.string().trim().required().messages({
            'any.required': 'Tỉnh người nhận là bắt buộc',
        }),
        ward_name: Joi.string().trim().allow("").default(""),
        detail_address: Joi.string().trim().required().messages({
            'any.required': 'Địa chỉ chi tiết là bắt buộc',
        }),
        weight_grams: Joi.number().integer().min(1).max(50000).default(500),
        service_type: Joi.string().valid('FAST', 'ECONOMY').default('FAST'),
    }),
};

export default shippingSchema;