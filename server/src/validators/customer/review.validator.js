import Joi from "Joi";

const reviewSchema = {
    createReview: Joi.object({
        rating: Joi.number().min(0).messages({
            'any.required': 'Tên loại hàng không được để trống.',
            'string.min': 'Tên loại hàng phải có ít nhất {#limit} sản phẩm.',
        }).required(),
        comment: Joi.string().default(null),
        media_urls: Joi.string().base64({ paddingRequired: true }).default(null),
        reply_comment: Joi.string().default(null),
        user_id: Joi.number().required(),
        order_id: Joi.number().required(),
        product_id: Joi.number().required(),
        is_hidden: Joi.boolean().default(true)
    }).unknown(false),

    updateReview: Joi.object({
        rating: Joi.number().min(0).messages({
            'any.required': 'Tên loại hàng không được để trống.',
            'string.min': 'Tên loại hàng phải có ít nhất {#limit} sản phẩm.',
        }).required(),
        comment: Joi.string().default(null),
        media_urls: Joi.string().base64({ paddingRequired: true }).default(null),
        reply_comment: Joi.string().default(null),
        user_id: Joi.number(),
        order_id: Joi.number(),
        product_id: Joi.number(),
        is_hiden: Joi.boolean().default(true)
    }).unknown(false)
}

export default reviewSchema;