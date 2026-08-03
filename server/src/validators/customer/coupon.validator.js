import Joi from "Joi";

const couponSchema = {
  checkCoupon: Joi.object({
    amount: Joi.number().min(0).required().messages({
      "number.base": "Tổng tiền đơn hàng phải là định dạng số",
      "number.min": "Tổng tiền không được là số âm",
      "any.required": "Hệ thống cần biết tổng tiền để áp dụng mã",
    }),
    code: Joi.string().trim().uppercase().required().messages({
      "string.empty": "Mã giảm giá không được để trống",
      "any.required": "Vui lòng cung cấp mã giảm giá",
    }),
  })
    .unknown(false)
    .min(2),
};

export default couponSchema;