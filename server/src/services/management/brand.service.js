import prisma from "../../db/prisma.js";
import { uploadImage } from "../image/image.service.js";

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

    getAllBrands: async (page) => {
        const limit = 12;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        const [brands, totalItems] = await Promise.all([
            prisma.Brands.findMany({
                take: limit,
                skip: skip,
            }),
            prisma.Brands.count()
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

    updateBrand: async (brandId, dataUpdate) => {
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
        await deleteImage(brandId, "brands", "logo");

        await prisma.Brands.delete({
            where: { id: brandId }
        })
    }
}

export default brandService;