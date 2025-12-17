import Joi from "Joi";

const attributeKeySchema = {
    createAttributeKey: Joi.object({
        name: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự.',
        }),
        unit: Joi.string()
    }).unknown(false),
    updateAttributeKey: Joi.object({
        name: Joi.string().min(1).max(100).messages({
            'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự.',
        }),
        unit: Joi.string()
    }).unknown(false),
}

export default attributeKeySchema;