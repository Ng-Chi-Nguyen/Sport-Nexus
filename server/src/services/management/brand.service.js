import prisma from "../../db/prisma.js";
import { uploadImage } from "../image.service.js";

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

    getAllBrands: async () => {
        let brands = await prisma.Brands.findMany()
        return brands;
    },

    updateBrand: async (brandId, dataUpdate) => {
        const brandToDelete = await prisma.Brands.findUnique({
            where: { id: brandId },
            select: { logo: true }
        });

        if (brandToDelete?.logo) {
            const BUCKET_NAME = 'general-uploads'; // Hoặc tên Bucket của bạn
            // Hàm deleteFile đã được xây dựng để phân tích URL và xóa file
            await uploadImage.deleteFile(brandToDelete.logo, BUCKET_NAME);
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
        const brandToDelete = await prisma.Brands.findUnique({
            where: { id: brandId },
            select: { logo: true }
        });

        if (brandToDelete?.logo) {
            const BUCKET_NAME = 'general-uploads'; // Hoặc tên Bucket của bạn
            // Hàm deleteFile đã được xây dựng để phân tích URL và xóa file
            await uploadImage.deleteFile(brandToDelete.logo, BUCKET_NAME);
        }

        await prisma.Brands.delete({
            where: { id: brandId }
        })
    }
}

export default brandService;