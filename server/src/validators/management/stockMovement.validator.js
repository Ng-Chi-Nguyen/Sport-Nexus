import Joi from "Joi";

const stockMovementSchema = {
    createStockMovement: Joi.object({
        type: Joi.string().valid("IN", "OUT", "ADJUSTMENT").required(),
        reference_id: Joi.number(),
        quantity_change: Joi.number().required(),
        reason: Joi.string().allow(null),
        variant_id: Joi.number().required()
    }),

    updateStockMovement: Joi.object({
        type: Joi.string().valid("IN", "OUT", "ADJUSTMENT"),
        reference_id: Joi.number(),
        quantity_change: Joi.number(),
        reason: Joi.string().allow(null),
        variant_id: Joi.number()
    }),
}

export default stockMovementSchema