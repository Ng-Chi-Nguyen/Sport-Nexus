import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";
const productVariantService = {
    createProductVariant: async (dataProductVariant) => {
        let { stock, price, product_id, attributes } = dataProductVariant;

        let newProductVariant = await prisma.productVariants.create({
            data: {
                stock: stock,
                price: price,
                product: { connect: { id: product_id } }
            }
        });

        let variantId = newProductVariant.id;

        let attributesData = attributes.map(attr => ({
            variable_id: variantId,
            attribute_key_id: attr.attribute_key_id,
            value: attr.value,
        }));

        // console.log(attributesData);

        await prisma.variableAttributes.createMany({
            data: attributesData,
        });

        let resultVariant = await prisma.ProductVariants.findUnique({
            where: { id: variantId },
            include: {
                VariableAttributes: {
                    select: {
                        value: true,
                        attributeKey: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        });

        return resultVariant;
    },

    getProductVariantById: async (variantId) => {
        let productVariant = await prisma.ProductVariants.findUnique({
            where: { id: variantId },
            include: {
                VariableAttributes: {
                    select: {
                        value: true,
                        attributeKey: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                // product: {
                //     select: {
                //         id: true,
                //         name: true,
                //     }
                // }
            }
        })
        return productVariant;
    },

    getProductVariantByProductid: async (productId) => {
        let productVariants = await prisma.ProductVariants.findMany({
            where: { product_id: productId, deleted_at: ACTIVE },
            include: {
                VariableAttributes: {
                    select: {
                        value: true,
                        attributeKey: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        })
        return productVariants;
    },

    getAllProductVariants: async ({ page, search, product_id, stock_min, stock_max, price_min, price_max, include_deleted } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = { deleted_at: ACTIVE }
        if (include_deleted) delete where.deleted_at;;
        if (search) where.product = { name: { contains: search } };
        if (product_id) where.product_id = parseInt(product_id);
        if (stock_min) where.stock = { ...where.stock, gte: parseInt(stock_min) };
        if (stock_max) where.stock = { ...where.stock, lte: parseInt(stock_max) };
        if (price_min) where.price = { ...where.price, gte: parseFloat(price_min) };
        if (price_max) where.price = { ...where.price, lte: parseFloat(price_max) };
        const [variants, totalItems] = await Promise.all([
            prisma.ProductVariants.findMany({
                where,
                take: limit,
                skip: skip,
                include: {
                    product: {
                        select: {
                            name: true,
                            base_price: true,
                            thumbnail: true
                        }
                    },
                    VariableAttributes: {
                        include: {
                            attributeKey: true
                        }
                    }
                },
                orderBy: { id: 'desc' }
            }),
            prisma.ProductVariants.count({ where })
        ])
        return {
            variants, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    getProductVariantsDropdown: async () => {
        return await prisma.productVariants.findMany({
            where: { deleted_at: ACTIVE },
            select: {
                id: true,
                product: {
                    select: {
                        name: true
                    }
                },
                VariableAttributes: {
                    select: {
                        value: true,
                        attributeKey: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
    },

    updateProductVariant: async (variantId, dataUpdate) => {
        const { attributes, ...variantData } = dataUpdate;
        return await prisma.$transaction(async (tx) => {
            await tx.productVariants.update({
                where: { id: variantId },
                data: variantData
            });

            if (attributes && Array.isArray(attributes)) {
                await tx.variableAttributes.deleteMany({
                    where: { variable_id: variantId }
                });

                let newAttributes = attributes.map(attr => ({
                    variable_id: Number(variantId),
                    attribute_key_id: attr.attribute_key_id,
                    value: attr.value
                }));

                await tx.variableAttributes.createMany({
                    data: newAttributes
                });
            }

            return await tx.productVariants.findUnique({
                where: { id: Number(variantId) },
                include: {
                    VariableAttributes: {
                        select: {
                            value: true,
                            attributeKey: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
        });
    },

    deleteProductVariant: async (variantId) => {
        await prisma.ProductVariants.update({
            where: { id: variantId },
            data: { deleted_at: new Date() }
        })
    }
}
export default productVariantService;