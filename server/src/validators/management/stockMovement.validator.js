import Joi from "Joi";

const stockMovementSchema = {
    createStockMovement: Joi.object({
        type: Joi.string().valid("IN", "OUT", "ADJUSTMENT").required(),
        order_id: Joi.number().allow(null),
        reason: Joi.string().allow(null, ""),
        items: Joi.array().items(
            Joi.object({
                product_variant_id: Joi.number().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        ).when('type', {
            is: 'ADJUSTMENT',
            then: Joi.array().optional(),
            otherwise: Joi.array().min(1).required()
        })
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