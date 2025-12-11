import Joi from "joi";

const brandSchema = {
    createBrand: Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Tên thương hiệu không được để trống',
        }),
        origin: Joi.string().required().messages({
            'any.required': 'Nơi xuất xứ không được để trống',
        }),
        logo_url: Joi.string().base64({ paddingRequired: true }).required().messages({
            'any.required': 'Logo thương hiệu không được để trống',
        })
    })
}

export default brandSchema;