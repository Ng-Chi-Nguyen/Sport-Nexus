import Joi from "joi";

const collectionSchema = {
    createCollection: Joi.object({
        name: Joi.string().min(3).max(150).required().messages({
            'any.required': 'Tên bộ sưu tập không được để trống.',
            'string.min': 'Tên bộ sưu tập phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên bộ sưu tập không được vượt quá {#limit} ký tự.',
        }),
        banner: Joi.any(),
        description: Joi.string().allow('').optional(),
        category_id: Joi.number().integer().required().messages({
            'any.required': 'Vui lòng chọn danh mục cho bộ sưu tập.',
            'number.base': 'Danh mục phải là số.',
        }),
        is_active: Joi.boolean().optional().messages({
            'boolean.base': 'Trạng thái hoạt động phải là đúng (true) hoặc sai (false).'
        }),
    }).unknown(false),

    updateCollection: Joi.object({
        name: Joi.string().min(3).max(150).optional().messages({
            'string.min': 'Tên bộ sưu tập phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên bộ sưu tập không được vượt quá {#limit} ký tự.',
        }),
        banner: Joi.any(),
        description: Joi.string().allow('').optional(),
        category_id: Joi.number().integer().optional().messages({
            'number.base': 'Danh mục phải là số.',
        }),
        is_active: Joi.boolean().optional().messages({
            'boolean.base': 'Trạng thái hoạt động phải là đúng (true) hoặc sai (false).'
        }),
    }).unknown(false),
};

export default collectionSchema;
