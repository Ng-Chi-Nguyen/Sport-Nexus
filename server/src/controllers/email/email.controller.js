
import emailService from "../../services/email/email.service.js";

import { t } from "../../locales/messages.js";
const emailController = {
    sendWelcome: async (req, res) => {
        const { email, full_name, token } = req.body;
        try {
            await emailService.sendWelcomeEmail(email, full_name, token);

            return res.status(200).json({
                status: true,
                message: t(req, "Email chào mừng đã được gửi thành công!")
            });
        } catch (error) {
            // Xử lý lỗi tập trung tại Controller
            return res.status(500).json({
                status: false,
                message: t(req, "Lỗi server nội bộ khi gửi mail"),
                error: error.message
            });
        }
    },

    sendSupport: async (req, res) => {
        const { full_name, email, phone, subject, message } = req.body;
        try {
            await emailService.sendSupportEmail({ full_name, email, phone, subject, message });

            return res.status(200).json({
                status: true,
                message: t(req, "Yêu cầu hỗ trợ đã được gửi thành công!")
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: t(req, "Lỗi server nội bộ khi gửi mail hỗ trợ"),
                error: error.message
            });
        }
    }
}

export default emailController;