import prisma from "../../db/prisma.js";

const supplierService = {
    createSuplier: async (supplierData) => {
        let { contact_person, email, phone, name, location_data, logo_url } = supplierData;
        let newSuplier = await prisma.Suppliers.create({
            data: {
                contact_person: contact_person,
                email: email,
                phone: phone,
                name: name,
                location_data: location_data,
                logo_url: logo_url
            },
            select: {
                id: true,
                contact_person: true,
                email: true,
                phone: true,
                name: true,
                location_data: true,
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

        await deleteImage(supplierId, "supplieres", "logo_url");
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

        await deleteImage(supplierId, "supplieres", "logo_url");
        await prisma.Suppliers.delete({
            where: {
                id: supplierId,
            },
        })
    }
}

export default supplierService;