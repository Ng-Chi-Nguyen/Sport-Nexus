import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { createAutoSlug } from "../../utils/slug.utils.js";
import { ACTIVE } from "../../utils/prisma.js";

const collectionService = {
    createCollection: async (dataCollection) => {
        const { name, banner, description, category_id, is_active } = dataCollection;
        const isActive = is_active === 'true' || is_active === true;
        const slug = await createAutoSlug(name, "Collections");

        return prisma.Collections.create({
            data: {
                name,
                slug,
                banner,
                description,
                category_id: parseInt(category_id),
                is_active: isActive,
            },
        });
    },

    getCollectionById: async (collectionId) => {
        return prisma.Collections.findUnique({
            where: { id: collectionId },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    },

    getAllCollection: async ({ page, is_active, search, include_deleted } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = { deleted_at: ACTIVE };
        if (is_active !== undefined && is_active !== '') {
            where.is_active = is_active === 'true';
        }
        if (search) where.name = { contains: search };
        if (include_deleted) delete where.deleted_at;

        const [list_collections, totalItems] = await Promise.all([
            prisma.Collections.findMany({
                where,
                take: limit,
                skip,
                orderBy: { id: "asc" },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    banner: true,
                    description: true,
                    is_active: true,
                    category: { select: { id: true, name: true, slug: true } },
                },
            }),
            prisma.Collections.count({ where }),
        ]);

        return {
            list_collections,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit,
            },
        };
    },

    updateCollection: async (collectionId, dataUpdate) => {
        if (dataUpdate.banner) {
            await deleteImage(collectionId, "Collections", "banner");
        }
        if (dataUpdate.is_active !== undefined) {
            dataUpdate.is_active = dataUpdate.is_active === 'true' || dataUpdate.is_active === true;
        }
        if (dataUpdate.category_id) {
            dataUpdate.category_id = parseInt(dataUpdate.category_id);
        }
        if (dataUpdate.name) {
            dataUpdate.slug = await createAutoSlug(dataUpdate.name, "Collections");
        }

        return prisma.Collections.update({
            where: { id: collectionId },
            data: dataUpdate,
        });
    },

    deleteCollection: async (collectionId) => {
        await prisma.Collections.update({
            where: { id: collectionId },
            data: { deleted_at: new Date() },
        });
    },
};

export default collectionService;
