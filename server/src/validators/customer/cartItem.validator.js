import Joi from "Joi";

const cartItemSchema = {
    createCartItem: Joi.object({
        quantity: Joi.number().min(1).messages({
            'any.required': 'Tên loại hàng không được để trống.',
            'string.min': 'Tên loại hàng phải có ít nhất {#limit} sản phẩm.',
        }).required(),
        cart_id: Joi.number().messages({
            'any.required': 'Logo thương hiệu không được để trống',
        }).required(),
        product_variant_id: Joi.number().messages({
            'boolean.base': 'Trạng thái hoạt động phải là đúng (true) hoặc sai (false).'
        }),
    }).unknown(false),

    updateCartItem: Joi.object({
        quantity: Joi.number().min(1).messages({
            'any.required': 'Tên loại hàng không được để trống.',
            'string.min': 'Tên loại hàng phải có ít nhất {#limit} sản phẩm.',
        }),
        cart_id: Joi.number().messages({
            'any.required': 'Logo thương hiệu không được để trống',
        }),
        product_variant_id: Joi.number().messages({
            'boolean.base': 'Trạng thái hoạt động phải là đúng (true) hoặc sai (false).'
        }),
    }).unknown(false)
}

export default cartItemSchema;