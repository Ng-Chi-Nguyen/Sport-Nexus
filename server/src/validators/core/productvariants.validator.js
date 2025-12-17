import Joi from "Joi";

const productVariantSchema = {
    createProductVariant: Joi.object({
        stock: Joi.number().min(1).messages({
            'string.min': 'Tồn kho phải có ít nhất {#limit}.',
        }).required(),
        price: Joi.number().min(1).messages({
            'string.min': 'Tồn kho phải có ít nhất {#limit}.',
        }).required(),
        product_id: Joi.number().required(),
        attributes: Joi.array().items(Joi.object({
            attribute_key_id: Joi.number().min(1).required(),
            value: Joi.string().required(),
        })).min(1).messages({
            'array.min': 'Biến thể phải có ít nhất một thuộc tính.',
            'any.required': 'Trường thuộc tính là bắt buộc.'
        }).required()
    }).unknown(false),
    updateProductVariant: Joi.object({
        stock: Joi.number().min(1).messages({
            'string.min': 'Tồn kho phải có ít nhất {#limit}.',
        }),
        price: Joi.number().min(1).messages({
            'string.min': 'Tồn kho phải có ít nhất {#limit}.',
        }),
        // product_id: Joi.number(),
        attributes: Joi.array().items(Joi.object({
            attribute_key_id: Joi.number().min(1),
            value: Joi.string(),
        })).min(1).messages({
            'array.min': 'Biến thể phải có ít nhất một thuộc tính.',
            'any.required': 'Trường thuộc tính là bắt buộc.'
        })
    }).unknown(false)
}

export default productVariantSchema;