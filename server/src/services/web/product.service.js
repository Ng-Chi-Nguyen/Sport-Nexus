import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";
import { getSoldCountsByProductIds } from "../../utils/soldCount.utils.js";

const safeInt = (val) => { const n = parseInt(val); return isNaN(n) ? undefined : n; };
const safeFloat = (val) => { const n = parseFloat(val); return isNaN(n) ? undefined : n; };

const productSelect = {
    id: true, name: true, slug: true,
    base_price: true, thumbnail: true, created_at: true,
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logo: true } },
    ProductVariants: {
        select: { id: true, price: true },
        orderBy: { price: "asc" },
        take: 1,
    },
    Reviews: {
        select: { rating: true },
    },
};

const mapProduct = (p) => {
    const ratings = p.Reviews.map((r) => r.rating);
    const avgRating =
        ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
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

const productWebService = {
    getAllProducts: async ({ page = 1, search, sort, category_id, category_ids, brand_id, brand_ids, price_min, price_max, limit = 12, attr_filter } = {}) => {
        const currentPage = Math.max(1, page);
        const take = Math.min(limit, 50);
        const skip = (currentPage - 1) * take;
        const where = { is_active: true, deleted_at: ACTIVE };

        const trimmedSearch = search?.trim();
        if (trimmedSearch) where.name = { contains: trimmedSearch };
        if (category_ids) {
            const ids = category_ids.split(',').map(s => safeInt(s.trim())).filter(n => n !== undefined);
            if (ids.length > 0) where.category_id = { in: ids };
        } else if (category_id) {
            where.category_id = safeInt(category_id);
        }
        if (brand_ids) {
            const ids = brand_ids.split(',').map(s => safeInt(s.trim())).filter(n => n !== undefined);
            if (ids.length > 0) where.brand_id = { in: ids };
        } else if (brand_id) {
            where.brand_id = safeInt(brand_id);
        }
        if (price_min) where.base_price = { ...where.base_price, gte: safeFloat(price_min) };
        if (price_max) where.base_price = { ...where.base_price, lte: safeFloat(price_max) };

        if (attr_filter) {
            const pairs = attr_filter.split(',').map(p => p.trim()).filter(Boolean);
            const conditions = [];
            for (const pair of pairs) {
                const [keyName, value] = pair.split(':').map(s => s.trim());
                if (keyName && value) conditions.push({ keyName, value });
            }
            if (conditions.length > 0) {
                const matchingVariants = await prisma.ProductVariants.findMany({
                    where: {
                        deleted_at: ACTIVE,
                        VariableAttributes: {
                            some: {
                                value: { in: conditions.map(c => c.value) },
                                attributeKey: {
                                    name: { in: conditions.map(c => c.keyName) },
                                },
                            },
                        },
                    },
                    select: { product_id: true },
                    distinct: ['product_id'],
                });
                const productIds = [...new Set(matchingVariants.map(v => v.product_id))];
                if (productIds.length > 0) {
                    where.id = { in: productIds };
                } else {
                    return { products: [], pagination: { totalItems: 0, totalPages: 1, currentPage: safeInt(page) || 1, itemsPerPage: take } };
                }
            }
        }

        let orderBy = { created_at: "desc" };
        if (sort === "price-asc") orderBy = { base_price: "asc" };
        if (sort === "price-desc") orderBy = { base_price: "desc" };
        if (sort === "newest") orderBy = { created_at: "desc" };

        let [products, totalItems] = await Promise.all([
            prisma.Products.findMany({
                where,
                orderBy,
                take,
                skip,
                select: productSelect,
            }),
            prisma.Products.count({ where }),
        ]);

        let mapped = products.map(mapProduct);

        const soldCounts = await getSoldCountsByProductIds(mapped.map((p) => p.id));
        mapped = mapped.map((p) => ({ ...p, sold_count: soldCounts.get(p.id) || 0 }));

        if (sort === "best-selling") {
            const topVariantIds = (await prisma.OrderItems.groupBy({
                by: ["product_variant_id"],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 200,
            })).map(v => v.product_variant_id);

            if (topVariantIds.length > 0) {
                const variants = await prisma.ProductVariants.findMany({
                    where: { id: { in: topVariantIds }, deleted_at: ACTIVE },
                    select: { product_id: true },
                });
                const topProductIds = [...new Set(variants.map(v => v.product_id))];
                mapped.sort((a, b) => topProductIds.indexOf(a.id) - topProductIds.indexOf(b.id));
            }
        }

        if (sort === "rating") {
            mapped.sort((a, b) => b.avg_rating - a.avg_rating);
        }

        return {
            products: mapped,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / take),
                currentPage,
                itemsPerPage: take,
            },
        };
    },

    getRelatedProducts: async (productId, { limit = 8 } = {}) => {
        const current = await prisma.Products.findFirst({
            where: { id: productId, deleted_at: ACTIVE },
            select: { id: true, category_id: true, brand_id: true },
        });
        if (!current) return { products: [] };

        const relatedSelect = {
            ...productSelect,
            ProductVariants: {
                select: { id: true, price: true },
                where: { stock: { gt: 0 }, deleted_at: ACTIVE },
                orderBy: { price: "asc" },
                take: 1,
            },
        };

        const products = await prisma.Products.findMany({
            where: {
                is_active: true,
                deleted_at: ACTIVE,
                category_id: current.category_id,
                id: { not: current.id },
                ProductVariants: { some: { stock: { gt: 0 }, deleted_at: ACTIVE } },
            },
            take: limit,
            select: relatedSelect,
        });

        let mapped = products.map(mapProduct);

        if (current.brand_id) {
            mapped.sort((a, b) =>
                (a.brand?.id === current.brand_id ? 0 : 1) -
                (b.brand?.id === current.brand_id ? 0 : 1),
            );
        }

        const soldCounts = await getSoldCountsByProductIds(mapped.map((p) => p.id));
        mapped = mapped.map((p) => ({ ...p, sold_count: soldCounts.get(p.id) || 0 }));

        return { products: mapped };
    },

    getAllCategories: async () => {
        return prisma.Categories.findMany({
            where: { is_active: true, deleted_at: ACTIVE },
            select: { id: true, name: true, slug: true, image: true },
        });
    },

    getAllBrands: async () => {
        return prisma.Brands.findMany({
            where: { deleted_at: ACTIVE },
            select: { id: true, name: true, logo: true },
        });
    },
};

export default productWebService;
