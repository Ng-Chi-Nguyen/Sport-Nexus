import Joi from "joi";

const productAttributeKeySchema = {
    create: Joi.object({
        product_id: Joi.number().integer().required().messages({
            'any.required': 'Sản phẩm không được để trống',
            'number.base': 'Sản phẩm phải là số',
        }),
        attribute_key_id: Joi.number().integer().required().messages({
            'any.required': 'Thuộc tính không được để trống',
            'number.base': 'Thuộc tính phải là số',
        }),
    }),
    update: Joi.object({
        product_id: Joi.number().integer(),
        attribute_key_id: Joi.number().integer(),
    }).min(1).unknown(false),
};

export default productAttributeKeySchema;
