import prisma from "../../db/prisma.js";

const REVIEW_LIST_LIMIT = 10;

const buildListWhere = ({ search, product_id, rating, status, reply }) => {
    const where = {};
    if (search) where.comment = { contains: search };
    if (product_id) where.product_id = Number(product_id);
    if (rating) where.rating = Number(rating);
    if (status === "hidden") where.is_hidden = true;
    if (status === "visible") where.is_hidden = false;
    if (reply === "replied") where.reply_comment = { not: null };
    if (reply === "unreplied") where.reply_comment = null;
    return where;
};

const reviewService = {
    getAllReviews: async ({ page, search, product_id, rating, status, reply } = {}) => {
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * REVIEW_LIST_LIMIT;
        const where = buildListWhere({ search, product_id, rating, status, reply });

        const [reviews, totalItems] = await Promise.all([
            prisma.reviews.findMany({
                where,
                include: {
                    user: { select: { id: true, full_name: true, avatar: true } },
                    product: { select: { id: true, name: true, slug: true } }
                },
                orderBy: { created_at: "desc" },
                take: REVIEW_LIST_LIMIT,
                skip
            }),
            prisma.reviews.count({ where })
        ]);

        return {
            reviews,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / REVIEW_LIST_LIMIT),
                currentPage,
                itemsPerPage: REVIEW_LIST_LIMIT
            }
        };
    },

    getReviewById: async (reviewId) => {
        return prisma.reviews.findUnique({ where: { id: Number(reviewId) } });
    },

    replyToReview: async (reviewId, replyComment) => {
        return prisma.reviews.update({
            where: { id: Number(reviewId) },
            data: { reply_comment: replyComment }
        });
    },

    deleteReply: async (reviewId) => {
        return prisma.reviews.update({
            where: { id: Number(reviewId) },
            data: { reply_comment: null }
        });
    },

    setVisibility: async (reviewId, isHidden) => {
        return prisma.reviews.update({
            where: { id: Number(reviewId) },
            data: { is_hidden: Boolean(isHidden) }
        });
    }
}

export default reviewService;
