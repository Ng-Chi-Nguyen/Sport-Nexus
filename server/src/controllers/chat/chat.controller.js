import { chatService } from "../../services/chat/chat.service.js";

export const chatController = {
    async handle(req, res) {
        const { message } = req.body || {};
        if (!message || !String(message).trim()) {
            return res
                .status(400)
                .json({ success: false, message: "Vui lòng nhập tin nhắn." });
        }
        try {
            const data = await chatService.handle({
                message,
                user: req.user || null,
            });
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi xử lý tin nhắn.",
                error: error.message,
            });
        }
    },
};