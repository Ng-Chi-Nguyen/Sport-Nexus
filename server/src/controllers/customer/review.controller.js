import reviewService from "../../services/customer/review.service.js";
import { uploadImage } from "../../services/image/image.service.js";

import { t } from "../../locales/messages.js";

const REVIEW_ERROR_STATUS = {
    ORDER_NOT_FOUND: 404,
    ORDER_NOT_OWNED: 403,
    ORDER_NOT_DELIVERED: 400,
    PRODUCT_NOT_IN_ORDER: 400,
    REVIEW_ALREADY_EXISTS: 409,
    REVIEW_NOT_FOUND: 404,
    REVIEW_NOT_OWNED: 403,
};

const reviewController = {
    createReview: async (req, res) => {
        let dataReview = req.body;
        let files = req.files;
        try {
            delete dataReview.user_id;

            let uploadedUrls = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => {
                    return uploadImage.uploadMediaImage(
                        file.buffer,
                        "new_media_review",
                        dataReview.product_id
                    );
                });
                uploadedUrls = await Promise.all(uploadPromises);
            }
            dataReview.media_urls = JSON.stringify(uploadedUrls);

            let newReview = await reviewService.createReview(dataReview, req.user);
            return res.status(201).json({
                success: true,
                message: t(req, "Đánh giá sản phẩm thành công."),
                data: newReview
            });
        } catch (error) {
            const status = REVIEW_ERROR_STATUS[error.code] || 500;
            return res.status(status).json({
                success: false,
                message: t(req, error.message || "Lỗi server nội bộ trong quá trình tạo tài khoản."),
                error: error.code ? undefined : error.message
            })
        }
    },

    updateReview: async (req, res) => {
        let reviewId = parseInt(req.params.id);
        let { product_id, user_id, ...dataReview } = req.body;
        let files = req.files;
        if (!product_id) {
            return res.status(400).json({ success: false, message: t(req, "Thiếu product_id") });
        }
        try {
            let existingMedia = [];
            const hasExistingMedia =
                dataReview.existing_media !== undefined &&
                dataReview.existing_media !== null;
            if (hasExistingMedia) {
                try {
                    existingMedia = JSON.parse(dataReview.existing_media);
                    if (!Array.isArray(existingMedia)) existingMedia = [];
                } catch {
                    existingMedia = [];
                }
            }
            delete dataReview.existing_media;
            delete dataReview.keep_old_media;

            let uploadedUrls = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => {
                    return uploadImage.uploadMediaImage(
                        file.buffer,
                        `${product_id}`,
                        product_id,
                        file.mimetype
                    );
                });
                uploadedUrls = await Promise.all(uploadPromises);
            }

            if (uploadedUrls.length > 0) {
                // Ghép ảnh giữ lại + ảnh mới
                dataReview.media_urls = JSON.stringify([...existingMedia, ...uploadedUrls]);
            } else if (hasExistingMedia) {
                // Giữ lại đúng danh sách ảnh đã chọn (có thể là [] để xóa hết)
                dataReview.media_urls = JSON.stringify(existingMedia);
            }

            // 2. Gọi service cập nhật
            const updatedReview = await reviewService.updateReview(reviewId, dataReview, req.user);

            return res.status(200).json({
                success: true,
                message: t(req, "Cập nhật đánh giá thành công."),
                data: updatedReview
            });

        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá cần cập nhật."),
                });
            }
            const status = REVIEW_ERROR_STATUS[error.code] || 500;
            return res.status(status).json({
                success: false,
                message: t(req, error.message || "Lỗi hệ thống khi cập nhật đánh giá."),
                error: error.code ? undefined : error.message
            });
        }
    },

    getReviewByProductId: async (req, res) => {
        let product_id = parseInt(req.params.id);
        try {
            let reviews = await reviewService.getReviewByProductId(product_id);
            if (!reviews || reviews.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không có đánh giá nào.")
                });
            }
            return res.status(200).json({
                success: true,
                data: reviews
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ trong quá trình tạo tài khoản."),
                error: error.message
            })
        }
    },

    deleteReview: async (req, res) => {
        let review_id = parseInt(req.params.id);
        try {
            await reviewService.deleteReview(review_id, req.user);
            return res.status(200).json({
                success: true,
                message: t(req, "Xóa đánh giá thành công")
            });

        } catch (error) {
            const status = REVIEW_ERROR_STATUS[error.code] || 500;
            return res.status(status).json({
                success: false,
                message: t(req, error.message || "Lỗi server nội bộ trong quá trình tạo tài khoản."),
                error: error.code ? undefined : error.message
            })
        }
    }
}

export default reviewController;
