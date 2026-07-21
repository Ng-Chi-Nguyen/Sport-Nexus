import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";
import { uploadImage } from "../image/image.service.js";
import { ACTIVE } from "../../utils/prisma.js";

const productService = {
    createProduct: async (productData) => {
        let { name, base_price, description, is_active, thumbnail, category_id, supplier_id, brand_id, fileBuffer } = productData;
        let slug = await createAutoSlug(name, "Products");
        const isActive = JSON.parse(is_active)
        // console.log(isActive)

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

    getProductBySlug: async (slug) => {
        let product = await prisma.Products.findFirst({
            where: { slug: slug, deleted_at: ACTIVE },
            include: {
                brand: { select: { id: true, name: true, logo: true } },
                category: { select: { id: true, name: true, slug: true } },
                ProductImages: { select: { id: true, url: true, is_primary: true } },
                ProductAttributeKeys: {
                    select: {
                        attributeKey: { select: { id: true, name: true, unit: true } },
                    },
                },
                ProductVariants: {
                    select: {
                        id: true, price: true, stock: true,
                        VariableAttributes: {
                            select: {
                                id: true, value: true,
                                attributeKey: { select: { id: true, name: true, unit: true } },
                            },
                        },
                    },
                    orderBy: { price: "asc" },
                },
                Reviews: {
                    select: {
                        id: true, rating: true, comment: true, user_id: true, created_at: true,
                        user: { select: { id: true, full_name: true, avatar: true } },
                    },
                    take: 10,
                    orderBy: { created_at: "desc" },
                },
            },
        })
        // console.log(product)
        return product;
    },

    getProductBySupplierId: async (supplierId) => {
        let product = await prisma.Products.findMany({
            where: { supplier_id: supplierId, deleted_at: ACTIVE }
        })
        return product;
    },

    getProductByBrandId: async (brandId) => {
        let product = await prisma.Products.findMany({
            where: { brand_id: brandId, deleted_at: ACTIVE }
        })
        return product;
    },

    getProductByCategoryId: async (categoryId) => {
        let product = await prisma.Products.findMany({
            where: { category_id: categoryId, deleted_at: ACTIVE }
        })
        return product;
    },

    getAllProduct: async ({ page, search, is_active, category_id, brand_id, supplier_id, price_min, price_max, include_deleted } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = { deleted_at: ACTIVE };
        if (search) where.name = { contains: search };
        if (is_active !== undefined && is_active !== '') {
            where.is_active = is_active === 'true';
        }
        if (category_id) where.category_id = parseInt(category_id);
        if (brand_id) where.brand_id = parseInt(brand_id);
        if (supplier_id) where.supplier_id = parseInt(supplier_id);
        if (price_min) where.base_price = { ...where.base_price, gte: parseFloat(price_min) };
        if (price_max) where.base_price = { ...where.base_price, lte: parseFloat(price_max) };
        if (include_deleted) delete where.deleted_at;
        let [list_products, totalItems] = await Promise.all([
            prisma.Products.findMany({
                where,
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    name: true,
                    base_price: true,
                    description: true,
                    thumbnail: true,
                    is_active: true,
                    slug: true,
                    category: {
                        select: { name: true, id: true }
                    },
                    brand: {
                        select: { name: true, id: true }
                    },
                    supplier: {
                        select: { name: true, id: true }
                    },
                },
                orderBy: { id: 'desc' }
            }),
            prisma.Products.count({ where })
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

    getAllProductsDropdown: async () => {
        let products = await prisma.Products.findMany({
            where: { deleted_at: ACTIVE },
            select: {
                id: true,
                name: true,

            }
        });
        return products;
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
        await prisma.Products.update({
            where: { id: productId },
            data: { deleted_at: new Date() }
        })
    }
}

export default productService;