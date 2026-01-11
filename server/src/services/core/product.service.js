import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";
import { uploadImage } from "../image/image.service.js";

const productService = {
    createProduct: async (productData) => {
        let { name, base_price, description, is_active, thumbnail, category_id, supplier_id, brand_id, fileBuffer } = productData;
        let slug = await createAutoSlug(name, "Products");
        const isActive = JSON.parse(is_active)
        console.log(isActive)

        let newProduct = await prisma.Products.create({
            data: {
                name: name,
                base_price: base_price,
                description: description,
                thumbnail: thumbnail,
                is_active: isActive,
                category: { connect: { id: category_id } },
                supplier: { connect: { id: supplier_id } },
                brand: { connect: { id: brand_id } },
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

    getAllProduct: async (page) => {
        // console.log(page)
        const limit = 6;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        // console.log(skip)
        let [list_products, totalItems] = await Promise.all([
            prisma.Products.findMany({
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    name: true,
                    base_price: true,
                    description: true,
                    thumbnail: true,
                    is_active: true,
                    is_active: true,
                    slug: true,
                    category: {
                        select: {
                            name: true,
                        }
                    },
                    brand: {
                        select: {
                            name: true,
                        }
                    },
                    supplier: {
                        select: {
                            name: true,
                        }
                    },
                }
            }),
            prisma.Products.count()
        ])
        return {
            list_products, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    updateProduct: async (productId, dataUpdate) => {
        // console.log(dataUpdate)
        if (dataUpdate.thumbnail)
            await deleteImage(productId, "Products", "thumbnail");
        if (dataUpdate.name) {
            let slug = await createAutoSlug(dataUpdate.name, "Products");
            dataUpdate.slug = slug;
        }

        if (dataUpdate.is_active !== undefined) {
            dataUpdate.is_active = dataUpdate.is_active === "true" || dataUpdate.is_active === true;
        }

        if (dataUpdate.supplier_id) {
            dataUpdate.supplier_id = parseInt(dataUpdate.supplier_id);
        }
        if (dataUpdate.category_id) {
            dataUpdate.category_id = parseInt(dataUpdate.category_id);
        }
        if (dataUpdate.brand_id) {
            dataUpdate.brand_id = parseInt(dataUpdate.brand_id);
        }

        // console.log(dataUpdate)

        let updateProduct = await prisma.Products.update({
            where: { id: productId },
            data: dataUpdate
        })
        return updateProduct
    },

    deleteProduct: async (productId) => {
        // await deleteImage(productId, "Products", "thumbnail");
        await prisma.Products.delete({ where: { id: productId } })
    }
}

export default productService;