import Joi from "Joi";

const email = Joi.string().email().custom((value, helpers) => {
    if (value.endsWith('@gail.com')) {
        return helpers.error('string.custom');
    }
    return value;
}).required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email không được để trống',
    'string.custom': 'Tên miền email có vẻ bị lỗi chính tả (ví dụ: @gmail.com).',
});

const authSchema = {
    login: Joi.object({
        username: Joi.alternatives().try(
            email,
            Joi.string().length(10).pattern(/^[0-9]+$/).messages({
                'string.length': 'Số điện thoại phải đúng 10 số',
                'string.pattern.base': 'Số điện thoại chỉ được chứa chữ số'
            })
        ).required().messages({
            'any.required': 'Vui lòng nhập Email hoặc Số điện thoại để đăng nhập'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Mật khẩu không được để trống',
        }),
    }),

    changePassword: Joi.object({
        current_password: Joi.string().required().messages({
            'any.required': 'Mật khẩu hiện tại không được để trống',
        }),
        new_password: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
            'any.required': 'Mật khẩu mới không được để trống',
        }),
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
            'any.only': 'Mật khẩu xác nhận không khớp',
            'any.required': 'Vui lòng nhập lại mật khẩu mới',
        }),
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Vui lòng nhập email',
        }),
    }),

    resetPassword: Joi.object({
        password: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
            'any.required': 'Mật khẩu không được để trống',
        }),
        confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Mật khẩu xác nhận không khớp',
            'any.required': 'Vui lòng nhập lại mật khẩu',
        }),
    }),
}

export default authSchema;