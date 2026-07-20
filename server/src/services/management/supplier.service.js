import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { ACTIVE } from "../../utils/prisma.js";

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

    getAllSuppliers: async ({ page, search, province, include_deleted } = {}) => {
        const limit = 5;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;
        let AND = [{ deleted_at: ACTIVE }];
        if (search) AND.push({
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { contact_person: { contains: search } },
            ]
        });
        if (province) {
            const rows = await prisma.$queryRaw`
                SELECT id FROM Suppliers
                WHERE JSON_UNQUOTE(JSON_EXTRACT(location_data, '$.province')) = ${province}
            `;
            const ids = rows.map(r => r.id);
            if (ids.length === 0) {
                return { supplier: [], pagination: { totalItems: 0, totalPages: 0, currentPage, itemsPerPage: limit } };
            }
            AND.push({ id: { in: ids } });
        }
        const where = AND.length > 0 ? { AND } : {};
        if (include_deleted) where.AND = where.AND.filter(c => !c.deleted_at);
        const [supplier, totalItems] = await Promise.all([
            prisma.Suppliers.findMany({ where, take: limit, skip }),
            prisma.Suppliers.count({ where })
        ])
        return {
            supplier, pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit
            }
        };
    },

    getDistinctProvinces: async () => {
        const rows = await prisma.$queryRaw`
            SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(location_data, '$.province')) AS province
            FROM Suppliers
            WHERE JSON_UNQUOTE(JSON_EXTRACT(location_data, '$.province')) IS NOT NULL
              AND JSON_UNQUOTE(JSON_EXTRACT(location_data, '$.province')) != ''
            ORDER BY province ASC
        `;
        return rows.map(r => r.province);
    },

    getSuppliersDropdown: async () => {
        let suppliers = await prisma.Suppliers.findMany({
            where: { deleted_at: ACTIVE },
            select: {
                id: true,
                name: true
            }
        });
        return suppliers;
    },

    updateSuplier: async (supplierId, dataUpdate) => {
        // console.log(dataUpdate.logo_url)
        if (dataUpdate.logo_url)
            await deleteImage(supplierId, "suppliers", "logo_url");
        // console.log("OK")
        let updateData = await prisma.Suppliers.update({
            where: { id: supplierId },
            data: dataUpdate,
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

        return updateData;
    },

    deleteSupplier: async (supplierId) => {
        await prisma.Suppliers.update({
            where: { id: supplierId },
            data: { deleted_at: new Date() }
        })
    }
}

export default supplierService;