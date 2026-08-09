import Joi from "Joi";

const loyaltyManagementSchema = {
  createTier: Joi.object({
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Tên hạng không được để trống",
      "any.required": "Vui lòng nhập tên hạng",
    }),
    min_spent: Joi.number().min(0).required().messages({
      "number.base": "Ngưỡng chi phải là số",
      "any.required": "Vui lòng nhập ngưỡng chi",
    }),
    reward_rate: Joi.number().min(0).default(0),
    discount_percent: Joi.number().integer().min(0).max(100).default(0),
    sort_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
  })
    .unknown(false)
    .min(2),

  updateTier: Joi.object({
    name: Joi.string().trim().min(1).optional(),
    min_spent: Joi.number().min(0).optional(),
    reward_rate: Joi.number().min(0).optional(),
    discount_percent: Joi.number().integer().min(0).max(100).optional(),
    sort_order: Joi.number().integer().min(0).optional(),
    is_active: Joi.boolean().optional(),
  })
    .unknown(false)
    .min(1),

  createReward: Joi.object({
    tier_id: Joi.number().integer().positive().required().messages({
      "any.required": "Vui lòng chọn hạng",
    }),
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Tên quà không được để trống",
      "any.required": "Vui lòng nhập tên quà",
    }),
    point_cost: Joi.number().integer().positive().required().messages({
      "any.required": "Vui lòng nhập số điểm",
    }),
    coupon_code: Joi.string().trim().allow("", null).optional(),
    is_active: Joi.boolean().default(true),
  })
    .unknown(false)
    .min(2),

  updateReward: Joi.object({
    tier_id: Joi.number().integer().positive().optional(),
    name: Joi.string().trim().min(1).optional(),
    point_cost: Joi.number().integer().positive().optional(),
    coupon_code: Joi.string().trim().allow("", null).optional(),
    is_active: Joi.boolean().optional(),
  })
    .unknown(false)
    .min(1),

  updateSettings: Joi.object({
    points_to_money_rate: Joi.number().integer().positive().optional(),
  })
    .unknown(false)
    .min(1),

  adjustPoints: Joi.object({
    points: Joi.number().integer().required().messages({
      "number.base": "Số điểm phải là số nguyên",
      "any.required": "Vui lòng nhập số điểm",
    }),
    note: Joi.string().trim().allow("", null).optional(),
  })
    .unknown(false)
    .min(1),
};

export default loyaltyManagementSchema;
