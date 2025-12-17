import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";
import { uploadImage } from "../image.service.js";

const productService = {
    createProduct: async (productData) => {
        let { name, base_price, description, thumbnail, category_id, supplier_id, brand_id, fileBuffer } = productData;
        let slug = await createAutoSlug(name, "Products");
        console.log(productData)
        let newProduct = await prisma.Products.create({
            data: {
                name: name,
                base_price: base_price,
                description: description,
                thumbnail: thumbnail,
                category: { connect: { id: category_id } },
                supplier: { connect: { id: supplier_id } },
                brand: { connect: { id: brand_id } },
                is_active: true,
                slug: slug
            }
        })

        let newProductId = newProduct.id;
        if (fileBuffer) {
            let thumbnail_url = await uploadImage.uploadProductImage(
                fileBuffer,
                "product_images",
                newProductId
            );

            newProduct = await prisma.Products.update({
                where: { id: newProductId },
                data: { thumbnail: thumbnail_url }
            });

            await prisma.ProductImages.create({
                data: {
                    url: thumbnail_url,
                    is_primary: true,
                    product: { connect: { id: newProductId } }
                }
            });
        }

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
        // console.log(brandId)
        let product = await prisma.Products.findMany({
            where: { brand_id: brandId }
        })
        // console.log(product)
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
    },

    updateProduct: async (productId, dataUPdate) => {
        await deleteImage(productId, "Products", "thumbnail");
        if (dataUPdate.name) {
            let slug = await createAutoSlug(dataUPdate.name, "Products");
            dataUPdate.slug = slug;
        }
        let updateProduct = await prisma.Products.update({
            where: { id: productId },
            data: dataUPdate
        })
        return updateProduct
    },

    deleteProduct: async (productId) => {
        await deleteImage(productId, "Products", "thumbnail");
        await prisma.Products.delete({ where: { id: productId } })
    }
}

export default productService;