import ejs from "ejs";
import path from "path";
import { transporter } from "../../configs/mail.config.js";

const emailAdmin = process.env.EMAIL_ADMIN;

const emailService = {
    sendWelcomeEmail: async (email, full_name, token) => {
        // 1. Logic xử lý template
        const templatePath = path.resolve('src/views/emails/welcome.ejs');
        // console.log("Đang tìm file tại:", templatePath);
        // 2. Render HTML
        console.log(token)
        const html = await ejs.renderFile(templatePath, {
            full_name: full_name,
            verify_url: `http://localhost:8080/auth/token/${token}`
        });

        // 3. Thực hiện gửi mail
        return await transporter.sendMail({
            from: `"Sport Nexus" ${emailAdmin}`,
            to: email,
            subject: "Chào mừng thành viên mới!",
            html: html
        });
    }
};

export default emailService;