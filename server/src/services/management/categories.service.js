import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";

const categoryService = {
    createCategory: async (dataCategory) => {

        let { name, image } = dataCategory;

        let slug = await createAutoSlug(name, "categories")

        let newCategory = await prisma.categories.create({
            data: {
                name: name,
                slug: slug,
                image: image,
                is_active: true
            }
        })

        return newCategory;
    },

    getCategoryById: async (categoryId) => {
        let category = await prisma.categories.findUnique({
            where: { id: categoryId },
            select: {
                id: true,
                name: true,
                image: true,
                slug: true,
                is_active: true
            }
        })

        return category;
    },

    getAllCategory: async () => {
        let list_categories = await prisma.categories.findMany({
            select: {
                id: true,
                name: true,
                image: true,
                slug: true,
                is_active: true
            }
        });
        return list_categories;
    },

    updateCategory: async (categoryId, dataUpdate) => {

        await deleteImage(categoryId, "categories", "image");

        if (dataUpdate.name) {
            let slug = await createAutoSlug(dataUpdate.name, "categories");
            dataUpdate.slug = slug;
        }

        let updateData = await prisma.categories.update({
            where: { id: categoryId },
            data: dataUpdate,
            select: {
                id: true,
                name: true,
                image: true,
                slug: true,
                is_active: true
            }
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