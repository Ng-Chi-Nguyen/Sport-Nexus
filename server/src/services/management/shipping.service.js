import prisma from "../../db/prisma.js";
import { syncShipmentState } from "../shipping/ghnSimulator.service.js";

const shippingService = {
    getAllShipments: async ({ page = 1, status = "", search = "" } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { tracking_code: { contains: search } },
                { recipient_name: { contains: search } },
                { recipient_phone: { contains: search } },
            ];
            const searchId = Number(search);
            if (!isNaN(searchId)) where.OR.push({ order_id: searchId });
        }

        const [rows, totalItems] = await Promise.all([
            prisma.shipments.findMany({
                where,
                take: limit,
                skip,
                orderBy: { created_at: "desc" },
                include: {
                    order: { select: { id: true, final_amount: true, payment_method: true, status: true } },
                },
            }),
            prisma.shipments.count({ where }),
        ]);

        // Đồng bộ trạng thái theo thời gian thực cho từng vận đơn
        const shipments = await Promise.all(rows.map((s) => syncShipmentState(s.id)));

        return {
            shipments,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit,
            },
        };
    },

    getShipmentById: async (id) => {
        const shipment = await prisma.shipments.findUnique({
            where: { id: Number(id) },
            include: {
                order: {
                    select: { id: true, final_amount: true, payment_method: true, status: true, user_email: true },
                },
            },
        });
        if (!shipment) return null;
        const updated = await syncShipmentState(shipment.id);
        return { ...updated, order: shipment.order };
    },
};

export default shippingService;