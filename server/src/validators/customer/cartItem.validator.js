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
        product_variant_id: Joi.number(),
    }).unknown(false),

    updateCartItem: Joi.object({
        quantity: Joi.number().min(1).messages({
            'any.required': 'Tên loại hàng không được để trống.',
            'string.min': 'Tên loại hàng phải có ít nhất {#limit} sản phẩm.',
        }),
        product_variant_id: Joi.number()
    }).unknown(false)
}

export default cartItemSchema;