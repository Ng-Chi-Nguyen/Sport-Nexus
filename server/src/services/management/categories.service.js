import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";
import { ACTIVE } from "../../utils/prisma.js";

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

    getAllCategory: async ({ page, is_active, search, include_deleted } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = { deleted_at: ACTIVE };
        if (is_active !== undefined && is_active !== '') {
            where.is_active = is_active === 'true';
        }
        if (search) where.name = { contains: search };
        if (include_deleted) delete where.deleted_at;
        const [list_categories, totalItems] = await Promise.all([
            prisma.categories.findMany({
                where,
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
            prisma.categories.count({ where })
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

    getCategoriesDropdown: async () => {
        let categories = await prisma.Categories.findMany({
            where: { deleted_at: ACTIVE },
            select: {
                id: true,
                name: true,

            }
        }
        );
        return categories;
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
        await prisma.categories.update({
            where: { id: categoryId },
            data: { deleted_at: new Date() }
        })
    }
}

export default categoryService;