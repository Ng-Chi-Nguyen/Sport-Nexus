import prisma from "../../db/prisma.js";
import { createAutoSlug } from "../../utils/slug.utils.js";

const productService = {
    createProduct: async (productData) => {
        let { name, base_price, description, thumbnail, category_id, supplier_id, brand_id } = productData;
        let slug = await createAutoSlug(name, "Products");
        // console.log(productData)
        let newProduct = await prisma.Products.create({
            data: {
                name: name,
                base_price: base_price,
                description: description,
                thumbnail: thumbnail,
                category_id: category_id,
                supplier_id: supplier_id,
                brand_id: brand_id,
                is_active: true,
                slug: slug
            }
        })

        return newProduct;
    },

    getProductById: async (productId) => {

    },

    getAllProduct: async () => {

    }
}

export default productService;