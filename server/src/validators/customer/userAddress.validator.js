import Joi from "joi";

const userAddressSchema = {
    createUserAddress: Joi.object({
        recipient_name: Joi.string().min(3).max(100).messages({
            'string.min': 'Tên thương hiệu phải có ít nhất {#limit} ký tự.',
            'string.max': 'Tên thương hiệu không được vượt quá {#limit} ký tự.',
        }).required(),
        recipient_phone: Joi.string().length(10).messages({
            'any.length': 'Số điện thoại phải 10 số',
        }).required(),
        detail_address: Joi.string().max(155).messages({
            'string.max': 'Tên thương hiệu không được vượt quá {#limit} ký tự.',
        }).required(),
        location_data: Joi.object({
            // 1. Dữ liệu Tỉnh/Thành phố
            province: Joi.object({
                name: Joi.string().required(),
                code: Joi.number().required(),
            }).required().messages({
                'any.required': 'Dữ liệu Tỉnh/Thành phố là bắt buộc.',
                'object.base': 'Dữ liệu Tỉnh/Thành phố phải là một đối tượng.',
            }),

            // 2. Dữ liệu Quận/Huyện
            district: Joi.object({
                name: Joi.string().required(),
                code: Joi.number().required(),
            }).required().messages({
                'any.required': 'Dữ liệu Quận/Huyện là bắt buộc.',
            }),

            // 3. Dữ liệu Phường/Xã
            ward: Joi.object({
                name: Joi.string().required(),
                code: Joi.number().required(),
            }).required().messages({
                'any.required': 'Dữ liệu Phường/Xã là bắt buộc.',
            }),

        }).required().messages({
            'any.required': 'Dữ liệu hành chính (Tỉnh/Huyện/Xã) là bắt buộc.',
        }),
        type: Joi.string().valid('home', 'office', 'company').messages({
            'any.only': 'Loại giảm giá phải là "home, office" hoặc "company".',
        }).default('home'),
        is_default: Joi.boolean().optional(),
        user_id: Joi.number().required()
    })
}

export default userAddressSchema;