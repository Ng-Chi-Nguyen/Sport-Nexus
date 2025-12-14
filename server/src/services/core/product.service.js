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
        let product = await prisma.Products.findUnique({
            where: { id: productId }
        })
        return product;
    },

    getProductBySupplierId: async (supplierId) => {
        let product = await prisma.Products.findMany({
            where: { supplier_id: supplierId }
        })
        return product;
    },

    getProductByBrandId: async (brandId) => {
        console.log(brandId)
        let product = await prisma.Products.findMany({
            where: { brand_id: brandId }
        })
        console.log(product)
        return product;
    },

    getProductByCategoryId: async (categoryId) => {
        let product = await prisma.Products.findMany({
            where: { category_id: categoryId }
        })
        return product;
    },

    getAllProduct: async () => {
        let list_products = await prisma.Products.findMany()
        return list_products;
    }
}

export default productService;