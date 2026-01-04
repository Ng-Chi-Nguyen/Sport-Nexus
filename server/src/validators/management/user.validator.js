import Joi from "Joi";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<,>.?`~/]).{8,}$/;

const userSchema = {
    createUser: Joi.object({
        full_name: Joi.string().max(50).required().messages({
            'any.required': 'Họ tên không được để trống',
        }),
        email: Joi.string().email().custom((value, helpers) => {
            if (value.endsWith('@gail.com')) {
                return helpers.error('string.custom');
            }
            return value;
        }).required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Emmail không được để trống',
            'string.custom': 'Tên miền email có vẻ bị lỗi chính tả. Vui lòng kiểm tra lại.',
        }),
        password: Joi.string().pattern(passwordRegex).required().messages({
            'string.pattern.base': 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.',
            'any.required': 'Mật khẩu không được để trống',
        }),
        phone_number: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
            'string.length': 'Số điện thoại phải 10 số',
            'any.required': 'Số điện thoại không được để trống',
            'string.pattern.base': 'Số điện thoại chỉ sữ dụng số'
        }),
        avatar: Joi.string().base64({ paddingRequired: true }).default(null),
        slug: Joi.string(),
    }).unknown(false),

    updateUser: Joi.object({
        full_name: Joi.string(),
        email: Joi.string().email().custom((value, helpers) => {
            if (value.endsWith('@gail.com')) {
                return helpers.error('string.custom');
            }
            return value;
        }).messages({
            'string.email': 'Email không hợp lệ',
            'string.custom': 'Tên miền email có vẻ bị lỗi chính tả. Vui lòng kiểm tra lại.',
        }),
        password: Joi.string().pattern(passwordRegex).messages({
            'string.pattern.base': 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.',
        }),
        phone_number: Joi.string().length(10).pattern(/^[0-9]+$/).messages({
            'string.length': 'Số điện thoại phải 10 số',
            'string.pattern.base': 'Số điện thoại chỉ sữ dụng số'
        }),
        avatar: Joi.string().base64({ paddingRequired: true }),
        status: Joi.boolean().optional(),
        is_verified: Joi.boolean().optional(),
        slug: Joi.string(),

        // permissionIds: Joi.array().items(Joi.number().integer()).required(),
    }).unknown(false)
}

export default userSchema;