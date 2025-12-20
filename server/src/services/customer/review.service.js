import prisma from "../../db/prisma.js";
import { uploadImage } from "../image.service.js";

const reviewService = {
    createReview: async (dataReview) => {
        let { rating, comment, reply_comment, is_hidden, media_urls, user_id, product_id, order_id } = dataReview;
        // console.log(dataReview)
        let newReview = await prisma.reviews.create({
            data: {
                rating: Number(rating),
                comment: comment,
                reply_comment: reply_comment,
                is_hidden: is_hidden || true,
                media_urls: media_urls,
                user: { connect: { id: Number(user_id) } },
                product: { connect: { id: Number(product_id) } },
                order: { connect: { id: Number(order_id) } },
            }
        })
        return newReview;
    },

    updateReview: async (reviewId, dataReview) => {
        const { rating, comment, is_hidden, media_urls } = dataReview;
        const id = Number(reviewId);
        const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;

        // 1. Tìm Review hiện tại để lấy danh sách ảnh cũ
        const currentReview = await prisma.reviews.findUnique({
            where: { id: id },
            select: { media_urls: true }
        });

        const dbPromises = [];

        // 2. Xử lý xóa file cũ trên Storage nếu có media mới hoặc yêu cầu xóa
        if (media_urls && currentReview?.media_urls) {
            try {
                const oldUrls = JSON.parse(currentReview.media_urls);

                if (Array.isArray(oldUrls) && oldUrls.length > 0) {
                    // Thêm các tác vụ xóa file vào mảng promise
                    oldUrls.forEach(url => {
                        dbPromises.push(uploadImage.deleteFile(url, GENERAL_BUCKET));
                    });
                }
            } catch (e) {
                console.error("Lỗi parse JSON hoặc chuẩn bị xóa file:", e);
            }
        }

        // 3. Thêm tác vụ cập nhật Database vào mảng promise
        dbPromises.push(
            prisma.reviews.update({
                where: { id: id },
                data: {
                    rating: rating ? Number(rating) : undefined,
                    comment: comment,
                    is_hidden: is_hidden !== undefined ? (is_hidden == 1 || is_hidden === "true" || is_hidden === true) : undefined,
                    media_urls: media_urls, // Ghi đè bằng URL mới (JSON string)
                }
            })
        );

        // 4. Thực thi tất cả các tác vụ (Xóa Storage + Update DB)
        const results = await Promise.all(dbPromises);

        // Kết quả của lệnh Prisma update thường là phần tử cuối cùng trong mảng results
        return results[results.length - 1];
    },

    getReviewByProductId: async (productId) => {
        let reviews = await prisma.reviews.findMany({
            where: { product_id: productId }
        })
        return reviews;
    },

    deleteReview: async (reviewId) => {
        const id = Number(reviewId);
        const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;
        // 1. Tìm thông tin review để lấy danh sách media_urls
        const review = await prisma.reviews.findUnique({
            where: { id: id },
            select: { media_urls: true }
        });

        if (!review) {
            throw new Error("Không tìm thấy đánh giá để xóa.");
        }

        const dbPromises = [];

        // 2. Nếu có ảnh/video, đưa các tác vụ xóa vào mảng Promise
        if (review.media_urls) {
            try {
                const urls = JSON.parse(review.media_urls);
                if (Array.isArray(urls) && urls.length > 0) {
                    urls.forEach(url => {
                        // Gọi hàm xóa file bạn đã viết
                        dbPromises.push(uploadImage.deleteFile(url, GENERAL_BUCKET));
                    });
                }
            } catch (e) {
                console.error("Lỗi khi phân tích media_urls để xóa file:", e);
            }
        }

        // 3. Đưa lệnh xóa bản ghi Review trong Database vào mảng Promise
        dbPromises.push(
            prisma.reviews.delete({
                where: { id: id }
            })
        );

        // 4. Chạy song song tất cả các tác vụ
        await Promise.all(dbPromises);
    }
}

export default reviewService;