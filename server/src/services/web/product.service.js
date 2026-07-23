import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

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
    getAllProducts: async ({ page = 1, search, sort, category_id, brand_id, price_min, price_max, limit = 12 } = {}) => {
        const currentPage = Math.max(1, page);
        const take = Math.min(limit, 50);
        const skip = (currentPage - 1) * take;
        const where = { is_active: true, deleted_at: ACTIVE };

        const trimmedSearch = search?.trim();
        if (trimmedSearch) where.name = { contains: trimmedSearch, mode: "insensitive" };
        if (category_id) where.category_id = safeInt(category_id);
        if (brand_id) where.brand_id = safeInt(brand_id);
        if (price_min) where.base_price = { ...where.base_price, gte: safeFloat(price_min) };
        if (price_max) where.base_price = { ...where.base_price, lte: safeFloat(price_max) };

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
