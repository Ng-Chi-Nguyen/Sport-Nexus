import prisma from "../../db/prisma.js";

const supplierService = {
    createSuplier: async (supplierData) => {
        let { contact_person, email, phone, name, address } = supplierData;
        let newSuplier = await prisma.Suppliers.create({
            data: {
                contact_person: contact_person,
                email: email,
                phone: phone,
                name: name,
                address: address
            },
            select: {
                id: true,
                contact_person: true,
                email: true,
                phone: true,
                name: true,
                address: true
            }
        })

        return newSuplier;
    }
}

export default supplierService;