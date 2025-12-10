import Joi from "joi";

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
        address: Joi.string().required().messages({
            'any.required': 'Địa chỉ kho không được để trống',
        })
    })
}

export default supplierSchema;