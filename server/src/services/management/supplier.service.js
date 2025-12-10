import prisma from "../../db/prisma.js";
import { uploadImage } from "../image.service.js";

const supplierService = {
    createSuplier: async (supplierData) => {
        let { contact_person, email, phone, name, address, logo_url } = supplierData;
        let newSuplier = await prisma.Suppliers.create({
            data: {
                contact_person: contact_person,
                email: email,
                phone: phone,
                name: name,
                address: address,
                logo_url: logo_url
            },
            select: {
                id: true,
                contact_person: true,
                email: true,
                phone: true,
                name: true,
                address: true,
                logo_url: true
            }
        })

        return newSuplier;
    },

    getSupplierById: async (supplierId) => {
        let supplier = await prisma.Suppliers.findUnique({
            where: { id: supplierId }
        })

        return supplier;
    },

    getAllSuppliers: async () => {
        let supplier = await prisma.Suppliers.findMany()

        return supplier;
    },

    updateSuplier: async (supplierId, dataUpdate) => {

        const supplierToDelete = await prisma.Suppliers.findUnique({
            where: { id: supplierId },
            select: { logo_url: true }
        });

        if (supplierToDelete?.logo_url) {
            const AVATAR_BUCKET = 'general-uploads'; // Hoặc tên Bucket của bạn
            // Hàm deleteFile đã được xây dựng để phân tích URL và xóa file
            await uploadImage.deleteFile(supplierToDelete.logo_url, AVATAR_BUCKET);
        }


        let updateData = await prisma.Suppliers.update({
            where: { id: supplierId },
            data: dataUpdate,
            select: {
                id: true,
                contact_person: true,
                email: true,
                phone: true,
                name: true,
                address: true,
                logo_url: true
            }
        })

        return updateData;
    },

    deleteSupplier: async (supplierId) => {

        const supplierToDelete = await prisma.Suppliers.findUnique({
            where: { id: supplierId },
            select: { logo_url: true }
        });

        if (supplierToDelete?.logo_url) {
            const AVATAR_BUCKET = 'general-uploads'; // Hoặc tên Bucket của bạn
            // Hàm deleteFile đã được xây dựng để phân tích URL và xóa file
            await uploadImage.deleteFile(supplierToDelete.logo_url, AVATAR_BUCKET);
        }

        await prisma.Suppliers.delete({
            where: {
                id: supplierId,
            },
        })
    }
}

export default supplierService;