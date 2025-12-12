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
    }
}

export default categoryService;