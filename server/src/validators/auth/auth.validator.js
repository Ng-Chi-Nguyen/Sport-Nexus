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
    })
}

export default authSchema;