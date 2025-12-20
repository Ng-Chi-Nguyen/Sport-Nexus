import reviewService from "../../services/customer/review.service.js";
import { uploadImage } from "../../services/image.service.js";

const reviewController = {
    createReview: async (req, res) => {
        let dataReview = req.body;
        let files = req.files;
        try {

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

            let newReview = await reviewService.createReview(dataReview);
            // console.log(newReview)
            return res.status(201).json({
                success: true,
                message: "Đánh giá sản phẩm thành công.",
                data: newReview
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    updateReview: async (req, res) => {
        let reviewId = parseInt(req.params.id);
        let { product_id, ...dataReview } = req.body;
        let files = req.files;
        if (!product_id) {
            return res.status(400).json({ success: false, message: "Thiếu product_id" });
        }
        // console.log(product_id)
        try {
            let uploadedUrls = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => {
                    // console.log(product_id)
                    return uploadImage.uploadMediaImage(
                        file.buffer,
                        `${product_id}`,
                        product_id,
                        file.mimetype
                    );
                });
                uploadedUrls = await Promise.all(uploadPromises);
                // Ghi đè danh sách media mới
                dataReview.media_urls = JSON.stringify(uploadedUrls);
            } else if (dataReview.keep_old_media === 'false') {
                // Nếu khách muốn xóa hết ảnh cũ mà không upload ảnh mới
                dataReview.media_urls = JSON.stringify([]);
            }

            // 2. Gọi service cập nhật
            const updatedReview = await reviewService.updateReview(reviewId, dataReview);

            return res.status(200).json({
                success: true,
                message: "Cập nhật đánh giá thành công.",
                data: updatedReview
            });

        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đánh giá cần cập nhật.",
                });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi cập nhật đánh giá.",
                error: error.message
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
                    message: "Không có đánh giá nào."
                });
            }
            return res.status(200).json({
                success: true,
                data: reviews
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    },

    deleteReview: async (req, res) => {
        let review_id = parseInt(req.params.id);
        try {
            await reviewService.deleteReview(review_id);
            return res.status(200).json({
                success: true,
                message: "Xóa đánh giá thành công"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message
            })
        }
    }
}

export default reviewController;