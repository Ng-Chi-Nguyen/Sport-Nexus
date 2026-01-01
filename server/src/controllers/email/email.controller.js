
import emailService from "../../services/email/email.service.js";

const emailController = {
    sendWelcome: async (req, res) => {
        const { email, full_name, token } = req.body;
        try {
            await emailService.sendWelcomeEmail(email, full_name, token);

            return res.status(200).json({
                status: true,
                message: "Email chào mừng đã được gửi thành công!"
            });
        } catch (error) {
            // Xử lý lỗi tập trung tại Controller
            return res.status(500).json({
                status: false,
                message: "Lỗi server nội bộ khi gửi mail",
                error: error.message
            });
        }
    },

    getViewEmailWelcome: async (req, res) => {
        try {
            // 1. Định nghĩa dữ liệu giả (Dummy Data) để test
            const verify_url = "http://localhost:5173/home";
            const data = {
                full_name: "Nguyễn Chí Nguyện (Preview)",
                verify_url: verify_url
            };

            // 2. Render file EJS ra giao diện web
            res.render('emails/welcome', data);
            // Lưu ý: Đảm bảo bạn đã cấu hình app.set('view engine', 'ejs')
        } catch (error) {
            res.status(500).send("Lỗi render: " + error.message);
        }
    }
}

export default emailController;