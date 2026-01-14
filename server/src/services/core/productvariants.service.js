import prisma from "../../db/prisma.js";
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
            where: { product_id: productId },
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

    getAllProductVariants: async (page) => {
        const limit = 6;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        const [variants, totalItems] = await Promise.all([
            prisma.ProductVariants.findMany({
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
                }
            }),
            prisma.ProductVariants.count()
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
        await prisma.ProductVariants.delete({
            where: { id: variantId }
        })
    }
}
export default productVariantService;