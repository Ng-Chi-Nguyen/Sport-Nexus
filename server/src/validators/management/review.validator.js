import Joi from "Joi";

const reviewSchema = {
    // PUT /:id/reply — tạo/cập nhật nội dung trả lời
    replyReview: Joi.object({
        reply_comment: Joi.string().trim().min(1).max(1000).required()
    }).unknown(false),

    // PUT /:id/visibility — ẩn/hiện review
    visibilityReview: Joi.object({
        is_hidden: Joi.boolean().required()
    }).unknown(false)
}

export default reviewSchema;
