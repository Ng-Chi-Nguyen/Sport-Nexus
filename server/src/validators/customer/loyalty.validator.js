import Joi from "Joi";

const loyaltySchema = {
  applyPoints: Joi.object({
    points: Joi.number().integer().positive().required().messages({
      "number.base": "Số điểm phải là số nguyên",
      "number.integer": "Số điểm phải là số nguyên",
      "number.positive": "Số điểm phải lớn hơn 0",
      "any.required": "Vui lòng nhập số điểm",
    }),
  })
    .unknown(false)
    .min(1),
};

export default loyaltySchema;
