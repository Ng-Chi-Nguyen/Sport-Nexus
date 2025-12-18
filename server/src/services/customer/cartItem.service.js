import prisma from "../../db/prisma.js";

const cartItemService = {
    createCartItem: async (cartItemData) => {
        // console.log(cartItemData)
        let { quantity, product_variant_id, cart_id } = cartItemData;
        let newCartItem = prisma.CartItems.create({
            data: {
                quantity: quantity,
                product_variant_id: product_variant_id,
                cart_id: cart_id
            }
        })
        return newCartItem;
    },

    getCartItemById: async (cartItemId) => {
        let cartItem = await prisma.CartItems.findUnique({
            where: { id: cartItemId },
            include: {
                product_variant: {
                    include: {
                        product: true,
                        VariableAttributes: {
                            include: {
                                attributeKey: true
                            }
                        }
                    }
                }
            }
        })
        return cartItem;
    },

    getCartItemByCartId: async (cartId) => {
        let cartItems = await prisma.CartItems.findMany({
            where: { cart_id: cartId },
            include: {
                product_variant: {
                    include: {
                        product: true,
                        VariableAttributes: {
                            include: {
                                attributeKey: true
                            }
                        }
                    }
                }
            }
        })
        return cartItems;
    },

    updateCartItem: async (cartItemId, dataUpdate) => {
        let updateCartItem = await prisma.CartItems.update({
            where: { id: cartItemId },
            data: dataUpdate,
            include: {
                product_variant: {
                    include: {
                        product: true,
                        VariableAttributes: {
                            include: {
                                attributeKey: true
                            }
                        }
                    }
                }
            }
        })
        return updateCartItem;
    },

    deleteCartItem: async (cartItemId) => {
        await prisma.CartItems.delete({
            where: { id: cartItemId }
        })
    }
}

export default cartItemService;