import Joi from "Joi";

const permissionSchema = {
    createPermission: Joi.object({
        name: Joi.string().min(3).max(100).required().messages({
            'any.required': 'Tên quyền không được để trống',
            'string.min': 'Tên quyền phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên quyền không được vượt quá {#limit} ký tự.',
        }),
        module: Joi.string().min(3).max(100).required().messages({
            'any.required': 'Tên bảng không được để trống',
            'string.min': 'Tên bảng phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên bảng không được vượt quá {#limit} ký tự.',
        }),
        action: Joi.string().min(3).max(100).required().messages({
            'any.required': 'Tên quyền không được để trống',
            'string.min': 'Tên quyền phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên quyền không được vượt quá {#limit} ký tự.',
        }),
    }),

    updatePermission: Joi.object({
        name: Joi.string(),
        module: Joi.string(),
        action: Joi.string(),
    }).min(1).unknown(false)
}

export default permissionSchema;