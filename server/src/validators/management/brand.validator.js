import Joi from "joi";

const brandSchema = {
    createBrand: Joi.object({
        name: Joi.string().min(3).max(100).required().messages({
            'any.required': 'Tên thương hiệu không được để trống',
            'string.min': 'Tên thương hiệu phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên thương hiệu không được vượt quá {#limit} ký tự.',
        }),
        origin: Joi.string().min(2).max(150).required().messages({
            'any.required': 'Nơi xuất xứ không được để trống',
            'string.min': 'Nơi xuất xứ phải có ít nhất {#limit} ký tự.',
            'string.max': 'Nơi xuất xứ không được vượt quá {#limit} ký tự.',
        }),
        logo_url: Joi.string().base64({ paddingRequired: true }).required().messages({
            'any.required': 'Logo thương hiệu không được để trống',
        })
    }),

    updateBrand: Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Tên thương hiệu không được để trống',
        }),
        origin: Joi.string().required().messages({
            'any.required': 'Nơi xuất xứ không được để trống',
        }),
        logo_url: Joi.string().base64({ paddingRequired: true }).required().messages({
            'any.required': 'Logo thương hiệu không được để trống',
        })
    }).min(1)
}

export default brandSchema;