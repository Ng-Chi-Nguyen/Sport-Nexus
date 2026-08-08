import prisma from "../db/prisma.js";

const EXCLUDED_ORDER_STATUSES = ["Cancelled", "Refunded"];

export async function getSoldCountsByProductIds(productIds) {
    const cleanIds = [...new Set(productIds.map((id) => Number(id)).filter((id) => Number.isInteger(id)))];
    if (cleanIds.length === 0) return new Map();

    const groupedVariants = await prisma.OrderItems.groupBy({
        by: ["product_variant_id"],
        where: {
            order: { status: { notIn: EXCLUDED_ORDER_STATUSES } },
        },
        _sum: { quantity: true },
    });

    if (groupedVariants.length === 0) return new Map();

    const variantIds = groupedVariants.map((v) => v.product_variant_id);

    const variants = await prisma.ProductVariants.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, product_id: true },
    });

    const variantToProduct = new Map(variants.map((v) => [v.id, v.product_id]));

    const soldByProduct = new Map();
    for (const group of groupedVariants) {
        const productId = variantToProduct.get(group.product_variant_id);
        if (productId === undefined || !cleanIds.includes(productId)) continue;
        const current = soldByProduct.get(productId) || 0;
        soldByProduct.set(productId, current + (group._sum.quantity || 0));
    }

    return soldByProduct;
}

export async function getSoldCountByProductId(productId) {
    const map = await getSoldCountsByProductIds([productId]);
    return map.get(productId) || 0;
}
