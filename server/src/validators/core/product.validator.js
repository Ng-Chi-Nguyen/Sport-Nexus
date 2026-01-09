import Joi from "Joi";

const productSchema = {
    createProduct: Joi.object({
        name: Joi.string().min(3).max(155).messages({
            'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự.',
        }).required(),
        base_price: Joi.number().required(),
        is_active: Joi.boolean(),
        description: Joi.string(),
        thumbnail: Joi.string().base64({ paddingRequired: true }),
        category_id: Joi.number().required(),
        supplier_id: Joi.number().required(),
        brand_id: Joi.number().required(),
    }).unknown(false),
    updateProduct: Joi.object({
        name: Joi.string().min(3).max(155).messages({
            'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự.',
        }),
        base_price: Joi.number(),
        description: Joi.string(),
        thumbnail: Joi.string().base64({ paddingRequired: true }),
        category_id: Joi.number(),
        supplier_id: Joi.number(),
        brand_id: Joi.number(),
        is_active: Joi.boolean(),
    }).unknown(false),
}

export default productSchema;