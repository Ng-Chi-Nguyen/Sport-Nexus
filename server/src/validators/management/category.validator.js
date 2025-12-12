import Joi from "joi";

const categorySchema = {
    createCategory: Joi.object({
        name: Joi.string().min(3).max(150).messages({
            'any.required': 'Tên danh mục không được để trống.',
            'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên danh mục không được vượt quá {#limit} ký tự.',
        }).required(),
        image: Joi.any().messages({
            'any.required': 'Logo thương hiệu không được để trống',
        }).required(),
        is_active: Joi.boolean().optional().messages({
            'boolean.base': 'Trạng thái hoạt động phải là đúng (true) hoặc sai (false).'
        }),
    }).unknown(false)
}

export default categorySchema;