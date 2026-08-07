import prisma from "../../db/prisma.js";
import { uploadImage } from "../image/image.service.js";

const reviewService = {
    createReview: async (dataReview, user) => {
        let { rating, comment, reply_comment, is_hidden, media_urls, product_id, order_id } = dataReview;
        const userId = Number(user.id);
        product_id = Number(product_id);
        order_id = Number(order_id);

        const order = await prisma.orders.findUnique({
            where: { id: order_id },
            include: {
                OrderItems: {
                    include: {
                        product_variant: { select: { product_id: true } }
                    }
                }
            }
        });

        if (!order) {
            const err = new Error("Không tìm thấy đơn hàng.");
            err.code = "ORDER_NOT_FOUND";
            throw err;
        }

        const isOwner = order.usersId === userId || order.user_email === user.email;
        if (!isOwner) {
            const err = new Error("Bạn không có quyền đánh giá đơn hàng này.");
            err.code = "ORDER_NOT_OWNED";
            throw err;
        }

        if (order.status !== "Delivered") {
            const err = new Error("Chỉ có thể đánh giá đơn hàng đã giao.");
            err.code = "ORDER_NOT_DELIVERED";
            throw err;
        }

        const isProductInOrder = order.OrderItems.some(
            item => item.product_variant?.product_id === product_id
        );
        if (!isProductInOrder) {
            const err = new Error("Sản phẩm không thuộc đơn hàng này.");
            err.code = "PRODUCT_NOT_IN_ORDER";
            throw err;
        }

        const existingReview = await prisma.reviews.findFirst({
            where: { order_id, product_id }
        });
        if (existingReview) {
            const err = new Error("Sản phẩm này đã được đánh giá trong đơn hàng.");
            err.code = "REVIEW_ALREADY_EXISTS";
            throw err;
        }

        return prisma.reviews.create({
            data: {
                rating: Number(rating),
                comment: comment,
                reply_comment: reply_comment,
                is_hidden: is_hidden ?? false,
                media_urls: media_urls,
                user: { connect: { id: userId } },
                product: { connect: { id: product_id } },
                order: { connect: { id: order_id } },
            }
        });
    },

    updateReview: async (reviewId, dataReview, user) => {
        const { rating, comment, is_hidden, media_urls } = dataReview;
        const id = Number(reviewId);
        const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;

        // 1. Tìm Review hiện tại + kiểm tra quyền sở hữu
        const currentReview = await prisma.reviews.findUnique({
            where: { id: id },
            select: { media_urls: true, user_id: true }
        });

        if (!currentReview) {
            const err = new Error("Không tìm thấy đánh giá cần cập nhật.");
            err.code = "REVIEW_NOT_FOUND";
            throw err;
        }

        if (currentReview.user_id !== Number(user.id)) {
            const err = new Error("Bạn không có quyền chỉnh sửa đánh giá này.");
            err.code = "REVIEW_NOT_OWNED";
            throw err;
        }

        const dbPromises = [];

        // 2. Xử lý xóa file cũ trên Storage nếu có media mới hoặc yêu cầu xóa
        if (media_urls && currentReview?.media_urls) {
            let newUrls = [];
            try {
                newUrls = JSON.parse(media_urls);
                if (!Array.isArray(newUrls)) newUrls = [];
            } catch (e) {
                newUrls = [];
            }

            let oldUrls = [];
            try {
                oldUrls = JSON.parse(currentReview.media_urls);
                if (!Array.isArray(oldUrls)) oldUrls = [];
            } catch (e) {
                oldUrls = [];
            }

            const toDelete = oldUrls.filter(url => !newUrls.includes(url));
            toDelete.forEach(url => {
                dbPromises.push(uploadImage.deleteFile(url, GENERAL_BUCKET));
            });
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

    deleteReview: async (reviewId, user) => {
        const id = Number(reviewId);
        const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;

        // 1. Tìm thông tin review + kiểm tra quyền sở hữu
        const review = await prisma.reviews.findUnique({
            where: { id: id },
            select: { media_urls: true, user_id: true }
        });

        if (!review) {
            const err = new Error("Không tìm thấy đánh giá để xóa.");
            err.code = "REVIEW_NOT_FOUND";
            throw err;
        }

        if (review.user_id !== Number(user.id)) {
            const err = new Error("Bạn không có quyền xóa đánh giá này.");
            err.code = "REVIEW_NOT_OWNED";
            throw err;
        }

        const dbPromises = [];

        // 2. Nếu có ảnh/video, đưa các tác vụ xóa vào mảng Promise
        if (review.media_urls) {
            try {
                const urls = JSON.parse(review.media_urls);
                if (Array.isArray(urls) && urls.length > 0) {
                    urls.forEach(url => {
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
