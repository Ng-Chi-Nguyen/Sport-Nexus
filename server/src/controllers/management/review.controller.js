import reviewService from "../../services/management/review.service.js";
import { t } from "../../locales/messages.js";

const parseIdOrThrow = (rawId) => {
    const id = parseInt(rawId);
    if (!Number.isInteger(id) || id <= 0) {
        const err = new Error("ID đánh giá không hợp lệ.");
        err.code = "REVIEW_INVALID_ID";
        throw err;
    }
    return id;
};

const reviewController = {
    getAllReviews: async (req, res) => {
        const { page, search, product_id, rating, status, reply } = req.query;
        try {
            const result = await reviewService.getAllReviews({
                page, search, product_id, rating, status, reply
            });
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi tải danh sách đánh giá."),
                error: error.message
            });
        }
    },

    replyToReview: async (req, res) => {
        try {
            const reviewId = parseIdOrThrow(req.params.id);
            const updated = await reviewService.replyToReview(reviewId, req.body.reply_comment);
            return res.status(200).json({
                success: true,
                message: t(req, "Phản hồi đánh giá thành công."),
                data: updated
            });
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá.")
                });
            }
            if (error.code === "REVIEW_INVALID_ID") {
                return res.status(400).json({
                    success: false,
                    message: t(req, error.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi phản hồi đánh giá."),
                error: error.message
            });
        }
    },

    deleteReply: async (req, res) => {
        try {
            const reviewId = parseIdOrThrow(req.params.id);
            await reviewService.deleteReply(reviewId);
            return res.status(200).json({
                success: true,
                message: t(req, "Xóa phản hồi đánh giá thành công.")
            });
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá.")
                });
            }
            if (error.code === "REVIEW_INVALID_ID") {
                return res.status(400).json({
                    success: false,
                    message: t(req, error.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi xóa phản hồi đánh giá."),
                error: error.message
            });
        }
    },

    setVisibility: async (req, res) => {
        try {
            const reviewId = parseIdOrThrow(req.params.id);
            const updated = await reviewService.setVisibility(reviewId, req.body.is_hidden);
            return res.status(200).json({
                success: true,
                message: t(req, req.body.is_hidden ? "Đã ẩn đánh giá." : "Đã hiện đánh giá."),
                data: updated
            });
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá.")
                });
            }
            if (error.code === "REVIEW_INVALID_ID") {
                return res.status(400).json({
                    success: false,
                    message: t(req, error.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi cập nhật trạng thái đánh giá."),
                error: error.message
            });
        }
    }
}

export default reviewController;
