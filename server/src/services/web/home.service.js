import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";
import couponWebService from "./coupon.service.js";
import { getSoldCountsByProductIds } from "../../utils/soldCount.utils.js";

const productSelect = {
    id: true, name: true, slug: true,
    base_price: true, thumbnail: true, created_at: true,
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logo: true } },
    ProductVariants: {
        select: { id: true, price: true },
        where: { stock: { gt: 0 }, deleted_at: ACTIVE },
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
        first_variant_id: p.ProductVariants[0]?.id || null,
        avg_rating: avgRating,
        total_reviews: ratings.length,
    };
};

const homeService = {
    getHomePageData: async () => {
        const [newestProducts, categories, brands, bestSellersThisMonth, bestSellersAllTime, topRated, productsByCategory, coupons] =
            await Promise.all([
                homeService.getNewestProducts(),
                homeService.getCategories(),
                homeService.getBrands(),
                homeService.getBestSellersThisMonth(),
                homeService.getBestSellersAllTime(),
                homeService.getTopRated(),
                homeService.getProductsByCategory(),
                couponWebService.getActiveCoupons(),
            ]);

        return {
            newestProducts,
            categories,
            brands,
            bestSellersThisMonth,
            bestSellersAllTime,
            topRated,
            productsByCategory,
            coupons,
        };
    },

    getNewestProducts: async (limit = 6) => {
        const products = await prisma.Products.findMany({
            where: {
                is_active: true,
                deleted_at: ACTIVE,
                ProductVariants: { some: { stock: { gt: 0 }, deleted_at: ACTIVE } },
            },
            orderBy: { created_at: "desc" },
            take: limit,
            select: productSelect,
        });

        return homeService.mapProductsWithSold(products.map(mapProduct));
    },

    getCategories: async () => {
        return prisma.Categories.findMany({
            where: { is_active: true, deleted_at: ACTIVE },
            select: { id: true, name: true, slug: true, image: true },
        });
    },

    getBrands: async () => {
        return prisma.Brands.findMany({
            where: { deleted_at: ACTIVE },
            select: { id: true, name: true, logo: true },
        });
    },

    getBestSellers: async (limit = 12, { since } = {}) => {
        const where = since
            ? { order: { created_at: { gte: since } } }
            : undefined;

        const topVariants = await prisma.OrderItems.groupBy({
            by: ["product_variant_id"],
            _sum: { quantity: true },
            where,
            orderBy: { _sum: { quantity: "desc" } },
            take: limit * 2,
        });

        if (topVariants.length === 0) return [];

        const variantIds = topVariants.map((v) => v.product_variant_id);

        const variants = await prisma.ProductVariants.findMany({
            where: { id: { in: variantIds }, deleted_at: ACTIVE },
            select: {
                product_id: true,
                product: { select: productSelect },
            },
        });

        const seen = new Set();
        const bestSellers = variants
            .filter((v) => {
                if (seen.has(v.product_id)) return false;
                seen.add(v.product_id);
                return true;
            })
            .slice(0, limit);

        return homeService.mapProductsWithSold(bestSellers.map((v) => mapProduct(v.product)));
    },

    getBestSellersThisMonth: async (limit = 12) => {
        const now = new Date();
        const since = new Date(now.getFullYear(), now.getMonth(), 1);
        return homeService.getBestSellers(limit, { since });
    },

    getBestSellersAllTime: async (limit = 12) => {
        return homeService.getBestSellers(limit);
    },

    getTopRated: async (limit = 6) => {
        const products = await prisma.Products.findMany({
            where: {
                is_active: true,
                deleted_at: ACTIVE,
                Reviews: { some: {} },
                ProductVariants: { some: { stock: { gt: 0 }, deleted_at: ACTIVE } },
            },
            select: productSelect,
        });

        const mapped = products.map(mapProduct).sort((a, b) => b.avg_rating - a.avg_rating).slice(0, limit);
        return homeService.mapProductsWithSold(mapped);
    },

    getProductsByCategory: async (limit = 12) => {
        const categories = await prisma.Categories.findMany({
            where: { is_active: true, deleted_at: ACTIVE },
            orderBy: { id: "asc" },
            select: { id: true, name: true, slug: true, image: true },
        });

        const result = await Promise.all(
            categories.map(async (cat) => {
                const products = await prisma.Products.findMany({
                    where: {
                        is_active: true,
                        deleted_at: ACTIVE,
                        category_id: cat.id,
                        ProductVariants: { some: { stock: { gt: 0 }, deleted_at: ACTIVE } },
                    },
                    orderBy: { created_at: "desc" },
                    take: limit,
                    select: productSelect,
                });

                return {
                    category: cat,
                    products: await homeService.mapProductsWithSold(products.map(mapProduct)),
                };
            }),
        );

        return result;
    },

    mapProductsWithSold: async (mappedProducts) => {
        if (mappedProducts.length === 0) return mappedProducts;
        const soldCounts = await getSoldCountsByProductIds(mappedProducts.map((p) => p.id));
        return mappedProducts.map((p) => ({ ...p, sold_count: soldCounts.get(p.id) || 0 }));
    },
};

export default homeService;
