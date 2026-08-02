import Joi from "Joi";

const paymentSchema = {
    createPayment: Joi.object({
        method: Joi.string()
            .valid("COD", "BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY")
            .required()
            .messages({
                "any.only": "Phương thức thanh toán không hợp lệ",
                "any.required": "Phương thức thanh toán là bắt buộc",
            }),
        channel: Joi.string()
            .valid("BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY", "COD")
            .optional(),
    }),

    uploadReceipt: Joi.object({
        transaction_code: Joi.string().min(3).max(100).required().messages({
            "any.required": "Mã giao dịch là bắt buộc",
            "string.min": "Mã giao dịch quá ngắn",
        }),
        note: Joi.string().allow(null, "").optional(),
    }),

    adminConfirm: Joi.object({
        note: Joi.string().allow(null, "").optional(),
    }),

    adminRefund: Joi.object({
        note: Joi.string().allow(null, "").optional(),
    }),
};

export default paymentSchema;