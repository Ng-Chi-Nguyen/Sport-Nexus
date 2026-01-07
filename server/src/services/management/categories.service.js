import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";

const categoryService = {
    createCategory: async (dataCategory) => {

        let { name, image, is_active } = dataCategory;
        const isActive = JSON.parse(is_active)
        // console.log(typeof isActive);
        // console.log(dataCategory)
        let slug = await createAutoSlug(name, "categories")

        let newCategory = await prisma.categories.create({
            data: {
                name: name,
                slug: slug,
                image: image,
                is_active: isActive
            }
        })

        return newCategory;
    },

    getCategoryById: async (categoryId) => {
        let category = await prisma.categories.findUnique({
            where: { id: categoryId },
        })

        return category;
    },

    getAllCategory: async (page) => {
        // console.log(page)
        const limit = 6;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        const [list_categories, totalItems] = await Promise.all([
            prisma.categories.findMany({
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    slug: true,
                    is_active: true
                }
            }),
            prisma.categories.count()
        ])
        return {
            list_categories, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    updateCategory: async (categoryId, dataUpdate) => {
        // console.log(dataUpdate.image)
        if (dataUpdate.image)
            await deleteImage(categoryId, "categories", "image");

        if (dataUpdate.is_active !== undefined) {
            dataUpdate.is_active = dataUpdate.is_active === 'true' || dataUpdate.is_active === true;
        }
        if (dataUpdate.name) {
            let slug = await createAutoSlug(dataUpdate.name, "categories");
            dataUpdate.slug = slug;
        }

        let updateData = await prisma.categories.update({
            where: { id: categoryId },
            data: dataUpdate,
        })

        return updateData;
    },

    deleteCategory: async (categoryId) => {
        await deleteImage(categoryId, "categories", "image");
        await prisma.categories.delete({
            where: { id: categoryId }
        })
    }
}

export default categoryService;