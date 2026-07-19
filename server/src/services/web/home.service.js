import prisma from "../../db/prisma.js";

const productSelect = {
    id: true, name: true, slug: true,
    base_price: true, thumbnail: true, created_at: true,
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logo: true } },
    ProductVariants: {
        select: { price: true },
        orderBy: { price: "asc" },
        take: 1,
    },
    Reviews: {
        select: { rating: true },
        take: 20,
    },
};

const mapProduct = (p) => {
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
};

const homeService = {
    getHomePageData: async () => {
        const [newestProducts, categories, brands, bestSellers, topRated, productsByCategory] =
            await Promise.all([
                homeService.getNewestProducts(),
                homeService.getCategories(),
                homeService.getBrands(),
                homeService.getBestSellers(),
                homeService.getTopRated(),
                homeService.getProductsByCategory(),
            ]);

        return {
            newestProducts,
            categories,
            brands,
            bestSellers,
            topRated,
            productsByCategory,
        };
    },

    getNewestProducts: async (limit = 8) => {
        const products = await prisma.Products.findMany({
            where: { is_active: true },
            orderBy: { created_at: "desc" },
            take: limit,
            select: productSelect,
        });

        return products.map(mapProduct);
    },

    getCategories: async () => {
        return prisma.Categories.findMany({
            where: { is_active: true },
            select: { id: true, name: true, slug: true, image: true },
        });
    },

    getBrands: async () => {
        return prisma.Brands.findMany({
            select: { id: true, name: true, logo: true },
        });
    },

    getBestSellers: async (limit = 8) => {
        const topVariants = await prisma.OrderItems.groupBy({
            by: ["product_variant_id"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: limit * 2,
        });

        if (topVariants.length === 0) return [];

        const variantIds = topVariants.map((v) => v.product_variant_id);

        const variants = await prisma.ProductVariants.findMany({
            where: { id: { in: variantIds } },
            select: {
                product_id: true,
                product: { select: productSelect },
            },
        });

        const seen = new Set();
        return variants
            .filter((v) => {
                if (seen.has(v.product_id)) return false;
                seen.add(v.product_id);
                return true;
            })
            .slice(0, limit)
            .map((v) => mapProduct(v.product));
    },

    getTopRated: async (limit = 8) => {
        const products = await prisma.Products.findMany({
            where: { is_active: true, Reviews: { some: {} } },
            select: productSelect,
        });

        return products
            .map(mapProduct)
            .sort((a, b) => b.avg_rating - a.avg_rating)
            .slice(0, limit);
    },

    getProductsByCategory: async (limit = 8, maxCategories = 5) => {
        const categories = await prisma.Categories.findMany({
            where: { is_active: true },
            take: maxCategories,
            orderBy: { id: "asc" },
            select: { id: true, name: true, slug: true, image: true },
        });

        const result = await Promise.all(
            categories.map(async (cat) => {
                const products = await prisma.Products.findMany({
                    where: { is_active: true, category_id: cat.id },
                    orderBy: { created_at: "desc" },
                    take: limit,
                    select: productSelect,
                });

                return {
                    category: cat,
                    products: products.map(mapProduct),
                };
            }),
        );

        return result;
    },
};

export default homeService;
