import prisma from "../../db/prisma.js";
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
}

export default categoryService;