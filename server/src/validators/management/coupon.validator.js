import Joi from "Joi";

const couponSchema = {
    createCoupon: Joi.object({
        code: Joi.string().max(10).min(3).alphanum().uppercase()
            .messages({
                'string.max': 'Mã code chỉ tối đa 10 ký tự.',
                'string.min': 'Mã code ít nhất 3 ký tự.',
                'string.alphanum': 'Mã code chỉ có phép chữ và số.',
                'any.required': 'Mã code không được để trống.',
            }).required(),

        discount_value: Joi.number().min(1).max(10000000)
            .messages({
                'number.base': 'Giá trị giảm phải là số.',
                'number.min': 'Giá trị giảm phải lớn hơn 0.',
                'any.required': 'Giá trị giảm không được để trống.',
            }).required(),

        discount_type: Joi.string().valid('CASH', 'PERCENTAGE')
            .messages({
                'any.only': 'Loại giảm giá phải là "CASH" hoặc "PERCENTAGE".',
                'any.required': 'Loại giảm giá không được để trống.',
            }).required(),
        usage_limit: Joi.number().integer().min(1).required()
            .messages({
                'number.base': 'Giới hạn sử dụng phải là số nguyên.',
                'number.min': 'Giới hạn sử dụng phải ít nhất là 1.',
            }),
        max_discount: Joi.number().min(0).optional()
            .messages({
                'number.base': 'Giảm tối đa phải là số.',
            }),
        min_order_value: Joi.number().min(0).optional()
            .messages({
                'number.base': 'Giá trị đơn hàng tối thiểu phải là số.',
            }),
        end_date: Joi.date()
            .messages({
                'date.base': 'Ngày kết thúc không hợp lệ.',
                'date.greater': 'Ngày kết thúc phải sau Ngày bắt đầu.',
                'any.required': 'Ngày kết thúc không được để trống.',
            }).required(),
        start_date: Joi.date().less(Joi.ref('end_date'))
            .messages({
                'date.base': 'Ngày bắt đầu không hợp lệ.',
                'date.less': 'Ngày bắt đầu phải trước Ngày kết thúc.',
                'any.required': 'Ngày bắt đầu không được để trống.',
            }).required(),
        is_active: Joi.boolean().optional(),
    }).unknown(false),

    updateCoupon: Joi.object({
        code: Joi.string().max(10).min(3).alphanum().uppercase().messages({
            'string.max': 'Mã code chỉ tối đa 10 ký tự.',
            'string.min': 'Mã code ít nhất 3 ký tự.',
            'string.alphanum': 'Mã code chỉ có phép chữ và số.',
        }),

        discount_value: Joi.number().min(1).max(10000000).messages({
            'number.base': 'Giá trị giảm phải là số.',
            'number.min': 'Giá trị giảm phải lớn hơn 0.',
        }),

        discount_type: Joi.string().valid('CASH', 'PERCENTAGE').messages({
            'any.only': 'Loại giảm giá phải là "CASH" hoặc "PERCENTAGE".',
        }),
        usage_limit: Joi.number().integer().min(1).messages({
            'number.base': 'Giới hạn sử dụng phải là số nguyên.',
            'number.min': 'Giới hạn sử dụng phải ít nhất là 1.',
        }),
        max_discount: Joi.number().min(0).optional().messages({
            'number.base': 'Giảm tối đa phải là số.',
        }),
        min_order_value: Joi.number().min(0).optional().messages({
            'number.base': 'Giá trị đơn hàng tối thiểu phải là số.',
        }),
        end_date: Joi.date().messages({
            'date.base': 'Ngày kết thúc không hợp lệ.',
            'date.greater': 'Ngày kết thúc phải sau Ngày bắt đầu.',
        }),
        start_date: Joi.date().less(Joi.ref('end_date')).messages({
            'date.base': 'Ngày bắt đầu không hợp lệ.',
            'date.less': 'Ngày bắt đầu phải trước Ngày kết thúc.',
        }),
        is_active: Joi.boolean().optional(),
    }).unknown(false).min(1),

    checkCoupon: Joi.object({
        amount: Joi.number().min(0).required().messages({
            'number.base': 'Tổng tiền đơn hàng phải là định dạng số',
            'number.min': 'Tổng tiền không được là số âm',
            'any.required': 'Hệ thống cần biết tổng tiền để áp dụng mã'
        }),
        code: Joi.string().trim().uppercase().required().messages({
            'string.empty': 'Mã giảm giá không được để trống',
            'any.required': 'Vui lòng cung cấp mã giảm giá'
        })
    }).unknown(false).min(2)
}

export default couponSchema;