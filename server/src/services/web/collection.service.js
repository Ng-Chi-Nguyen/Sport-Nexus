import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";
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

const collectionService = {
    getCollections: async () => {
        return prisma.Collections.findMany({
            where: { is_active: true, deleted_at: ACTIVE },
            orderBy: { id: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                banner: true,
                description: true,
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    },

    getCollectionBySlug: async (slug, { limit = 12 } = {}) => {
        const collection = await prisma.Collections.findFirst({
            where: { slug, is_active: true, deleted_at: ACTIVE },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        if (!collection) return null;

        const products = await prisma.Products.findMany({
            where: {
                is_active: true,
                deleted_at: ACTIVE,
                category_id: collection.category_id,
                ProductVariants: { some: { stock: { gt: 0 }, deleted_at: ACTIVE } },
            },
            orderBy: { created_at: "desc" },
            take: limit,
            select: productSelect,
        });

        const mappedProducts = products.map(mapProduct);
        if (mappedProducts.length > 0) {
            const soldCounts = await getSoldCountsByProductIds(mappedProducts.map((p) => p.id));
            mappedProducts.forEach((p) => {
                p.sold_count = soldCounts.get(p.id) || 0;
            });
        }

        return {
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            banner: collection.banner,
            description: collection.description,
            category: collection.category,
            products: mappedProducts,
        };
    },
};

export default collectionService;
