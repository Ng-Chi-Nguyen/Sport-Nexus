import Joi from "Joi";

const productVariantSchema = {
    createProductVariant: Joi.object({
        stock: Joi.number().min(1).messages({
            'number.min': 'Số lượng tồn kho phải có ít nhất {#limit}.', // Đã sửa key
            'number.base': 'Số lượng tồn kho phải là con số.',
            'any.required': 'Vui lòng nhập số lượng tồn kho.'
        }).required(),

        price: Joi.number().min(1).messages({
            'number.min': 'Giá bán phải có ít nhất {#limit}.', // Đã sửa nội dung & key
            'number.base': 'Giá bán phải là con số.',
            'any.required': 'Vui lòng nhập giá bán.'
        }).required(),

        product_id: Joi.number().required(),

        attributes: Joi.array().items(
            Joi.object({
                attribute_key_id: Joi.number().min(1).required(),
                value: Joi.string().required(),
            })
        ).min(1).messages({
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