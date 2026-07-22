import prisma from "../../db/prisma.js";

const cartService = {
    getOrCreateCart: async (userId) => {
        let cart = await prisma.Carts.findUnique({
            where: { user_id: userId },
        });
        if (!cart) {
            cart = await prisma.Carts.create({
                data: { user_id: userId },
            });
        }
        return cart;
    },

    getCartWithItems: async (userId) => {
        const cart = await prisma.Carts.findUnique({
            where: { user_id: userId },
            include: {
                CartItems: {
                    include: {
                        product_variant: {
                            include: {
                                product: { select: { id: true, name: true, slug: true, thumbnail: true, base_price: true } },
                                VariableAttributes: {
                                    include: { attributeKey: { select: { name: true, unit: true } } },
                                },
                            },
                        },
                    },
                },
            },
        });
        return cart;
    },

    syncCart: async (userId, items) => {
        let cart = await cartService.getOrCreateCart(userId);

        for (const item of items) {
            const existing = await prisma.CartItems.findUnique({
                where: {
                    cart_id_product_variant_id: {
                        cart_id: cart.id,
                        product_variant_id: item.product_variant_id,
                    },
                },
            });

            if (existing) {
                await prisma.CartItems.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + item.quantity },
                });
            } else {
                await prisma.CartItems.create({
                    data: {
                        cart_id: cart.id,
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                    },
                });
            }
        }

        return cartService.getCartWithItems(userId);
    },
};

export default cartService;
