import Joi from "Joi";

const supplierSchema = {
    createSupplier: Joi.object({
        contact_person: Joi.string().required().messages({
            'any.required': 'Tên người liên hệ mua hàng không được để trống',
        }),
        email: Joi.string().email().custom((value, helpers) => {
            if (value.endsWith('@gail.com')) {
                return helpers.error('string.custom');
            }
            return value;
        }).required().messages({
            'string.email': 'emial không hợp lệ',
            'any.required': 'Thông tin liên lạc email không được để trống',
            'string.custom': 'Tên miền email có vẻ bị lỗi chính tả. Vui lòng kiểm tra lại.',
        }),
        phone: Joi.string().length(10).required().messages({
            'any.required': 'Thông tin liên lạc số điện thoại không được để trống',
        }),
        name: Joi.string().required().messages({
            'any.required': 'Tên nhà cung cấp không được để trống',
        }),
        location_data: Joi.object({
            // 1. Tỉnh/Thành phố
            province: Joi.string().required().messages({
                'any.required': 'Vui lòng chọn Tỉnh/Thành phố.',
                'string.empty': 'Tỉnh/Thành phố không được để trống.',
            }),
            // 2. Phường/Xã (Mô hình 2 cấp bạn đang dùng)
            ward: Joi.string().required().messages({
                'any.required': 'Vui lòng chọn Phường/Xã.',
                'string.empty': 'Phường/Xã không được để trống.',
            }),
            // 3. Địa chỉ cụ thể
            detail: Joi.string().allow('', null).messages({
                'string.base': 'Địa chỉ chi tiết phải là chuỗi văn bản.',
            }),
        }).required().messages({
            'any.required': 'Thông tin vị trí là bắt buộc.',
        }),
        logo_url: Joi.string().base64({ paddingRequired: true }).default(null)
    }).unknown(false),

    updateSupplier: Joi.object({
        contact_person: Joi.string(),
        email: Joi.string().email().custom((value, helpers) => {
            if (value.endsWith('@gail.com')) {
                return helpers.error('string.custom');
            }
            return value;
        }).messages({
            'string.email': 'emial không hợp lệ',
            'string.custom': 'Tên miền email có vẻ bị lỗi chính tả. Vui lòng kiểm tra lại.',
        }),
        phone: Joi.string().length(10),
        name: Joi.string(),
        address: Joi.string(),
        logo_url: Joi.string().base64({ paddingRequired: true })
    }).unknown(false)
}

export default supplierSchema;