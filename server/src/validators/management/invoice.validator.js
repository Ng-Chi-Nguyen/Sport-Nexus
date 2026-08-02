import Joi from "Joi";

const invoiceSchema = {
    createInvoice: Joi.object({
        order_id: Joi.number().integer().required().messages({
            'number.base': 'ID đơn hàng phải là số',
            'any.required': 'ID đơn hàng là bắt buộc'
        }),
        note: Joi.string().allow('').optional().messages({
            'string.base': 'Ghi chú phải là chuỗi'
        })
    })
}

export default invoiceSchema;
