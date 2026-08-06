import shippingService from "../../services/management/shipping.service.js";

import { t } from "../../locales/messages.js";
const shippingController = {
    async getAll(req, res) {
        try {
            const { page = 1, status = "", search = "" } = req.query;
            const result = await shippingService.getAllShipments({ page, status, search });

            if (!result.shipments.length) {
                return res.status(404).json({ success: false, message: t(req, "Chưa có vận đơn nào.") });
            }

            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message) || "Lỗi server nội bộ khi lấy danh sách vận đơn.",
            });
        }
    },

    async getById(req, res) {
        try {
            const shipment = await shippingService.getShipmentById(req.params.id);
            if (!shipment) {
                return res.status(404).json({ success: false, message: t(req, "Không tìm thấy vận đơn.") });
            }
            return res.status(200).json({ success: true, data: shipment });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message) || "Lỗi server nội bộ.",
            });
        }
    },
};

export default shippingController;