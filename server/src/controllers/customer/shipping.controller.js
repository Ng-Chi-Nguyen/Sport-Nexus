import prisma from "../../db/prisma.js";
import ghnSimulator from "../../services/shipping/ghnSimulator.service.js";

import { t } from "../../locales/messages.js";
const shippingController = {
    async calculate(req, res) {
        try {
            const fee = ghnSimulator.calculateFee({
                provinceName: req.body.province_name,
                weightGrams: req.body.weight_grams,
                serviceType: req.body.service_type,
                codAmount: req.body.cod_amount,
                itemValue: req.body.item_value,
            });
            return res.status(200).json({ success: true, data: fee });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message) || "Lỗi server nội bộ khi tính phí vận chuyển.",
            });
        }
    },

    async create(req, res) {
        try {
            const authUser = req.user?.id ? { id: req.user.id, email: req.user.email } : null;
            const order = await prisma.orders.findUnique({ where: { id: Number(req.body.order_id) } });

            if (!order) {
                return res.status(404).json({ success: false, message: t(req, "Không tìm thấy đơn hàng.") });
            }

            // Chỉ chủ sở hữu đơn mới được tạo vận đơn cho đơn đó
            const owned =
                authUser &&
                (order.user_email === authUser.email || order.usersId === authUser.id);
            if (!owned) {
                return res.status(403).json({ success: false, message: t(req, "Không có quyền tạo vận đơn cho đơn hàng này.") });
            }

            const shipment = await ghnSimulator.createShipmentForOrder({ order, data: req.body });
            return res.status(201).json({ success: true, message: t(req, "Đã tạo vận đơn."), data: shipment });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message) || "Lỗi server nội bộ khi tạo vận đơn.",
            });
        }
    },

    async track(req, res) {
        try {
            const { trackingCode } = req.params;
            if (!trackingCode) {
                return res.status(400).json({ success: false, message: t(req, "Thiếu mã vận đơn.") });
            }

            const shipment = await prisma.shipments.findUnique({
                where: { tracking_code: trackingCode },
                include: {
                    order: {
                        select: { id: true, final_amount: true, payment_method: true, status: true, user_email: true },
                    },
                },
            });

            if (!shipment) {
                return res.status(404).json({ success: false, message: t(req, "Không tìm thấy vận đơn.") });
            }

            const synced = await ghnSimulator.syncShipmentState(shipment.id);
            return res.status(200).json({ success: true, data: { ...synced, order: shipment.order } });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message) || "Lỗi server nội bộ khi tra cứu vận đơn.",
            });
        }
    },
};

export default shippingController;