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
}

export default cartItemService;