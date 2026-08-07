import Joi from "Joi";

const reviewSchema = {
    createReview: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().allow(null, "").default(null),
        media_urls: Joi.string().allow(null).default(null),
        reply_comment: Joi.string().allow(null).default(null),
        order_id: Joi.number().required(),
        product_id: Joi.number().required(),
        is_hidden: Joi.boolean().default(false)
    }).unknown(false),

    updateReview: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().allow(null, "").default(null),
        media_urls: Joi.string().allow(null).default(null),
        reply_comment: Joi.string().allow(null).default(null),
        order_id: Joi.number(),
        product_id: Joi.number(),
        is_hidden: Joi.boolean().default(false),
        existing_media: Joi.string().allow(null, "").default(null),
        keep_old_media: Joi.string().allow(null, "true", "false").default(null)
    }).unknown(false)
}

export default reviewSchema;
