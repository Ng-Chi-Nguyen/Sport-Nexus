import prisma from "../../db/prisma.js";

const homeService = {
    getHomePageData: async () => {
        const [newestProducts] = await Promise.all([
            homeService.getNewestProducts(),
        ]);

        return {
            newestProducts,
        };
    },

    getNewestProducts: async (limit = 8) => {
        const products = await prisma.Products.findMany({
            where: { is_active: true },
            orderBy: { created_at: "desc" },
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                base_price: true,
                thumbnail: true,
                created_at: true,
                category: {
                    select: { id: true, name: true, slug: true },
                },
                brand: {
                    select: { id: true, name: true, logo: true },
                },
                ProductVariants: {
                    select: { price: true },
                    orderBy: { price: "asc" },
                    take: 1,
                },
                Reviews: {
                    select: { rating: true },
                },
            },
        });

        return products.map((p) => {
            const ratings = p.Reviews.map((r) => r.rating);
            const avgRating =
                ratings.length > 0
                    ? Math.round(
                        (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
                    ) / 10
                    : 0;

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                base_price: p.base_price,
                thumbnail: p.thumbnail,
                created_at: p.created_at,
                category: p.category,
                brand: p.brand,
                min_price: Number(p.ProductVariants[0]?.price) || Number(p.base_price),
                avg_rating: avgRating,
                total_reviews: ratings.length,
            };
        });
    },
};

export default homeService;