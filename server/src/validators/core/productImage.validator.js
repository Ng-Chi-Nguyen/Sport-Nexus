import Joi from "Joi";

const productImageSchema = {
    createProductImage: Joi.object({
        url: oi.string().base64({ paddingRequired: true }),
        product_id: Joi.number().required()
    }).unknown(false),
    updateProductImage: Joi.object({
        url: Joi.string().base64({ paddingRequired: true }),
        is_primary: Joi.bool(),
        product_id: Joi.number()
    }).unknown(false),
}

export default productImageSchema;