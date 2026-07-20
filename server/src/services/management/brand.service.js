import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { uploadImage } from "../image/image.service.js";
import { ACTIVE } from "../../utils/prisma.js";

const brandService = {
    createBrand: async (brandData) => {
        let { name, origin, logo } = brandData;
        let newBrand = await prisma.Brands.create({
            data: {
                name: name,
                origin: origin,
                logo: logo
            },
            select: {
                id: true,
                name: true,
                origin: true,
                logo: true
            }
        })

        return newBrand;
    },

    getBrandById: async (brandId) => {
        let brand = await prisma.Brands.findUnique({
            where: { id: brandId },
        })

        return brand;
    },

    getAllBrands: async ({ page, origin, search, include_deleted } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        const where = { deleted_at: ACTIVE };
        if (origin) where.origin = origin;
        if (search) where.name = { contains: search };
        if (include_deleted) delete where.deleted_at;
        const [brands, totalItems] = await Promise.all([
            prisma.Brands.findMany({
                where,
                take: limit,
                skip: skip,
            }),
            prisma.Brands.count({ where })
        ])
        return {
            brands, totalItems, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    getBrandsDropdown: async () => {
        let brands = await prisma.Brands.findMany({
            where: { deleted_at: ACTIVE },
            select: {
                id: true,
                name: true,
                origin: true

            }
        });
        return brands;
    },

    updateBrand: async (brandId, dataUpdate, currentBrand) => {
        // console.log(brandId)
        // console.log(dataUpdate)
        if (currentBrand.logo) {
            await deleteImage(brandId, "brands", "logo");
        }
        let updateData = await prisma.Brands.update({
            where: { id: brandId },
            data: dataUpdate,
            select: {
                id: true,
                name: true,
                origin: true,
                logo: true,
                name: true,
            }
        })

        return updateData;
    },

    deleteBrand: async (brandId) => {
        await prisma.Brands.update({
            where: { id: brandId },
            data: { deleted_at: new Date() }
        })
    }
}

export default brandService;