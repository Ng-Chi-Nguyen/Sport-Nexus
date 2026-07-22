import ejs from "ejs";
import path from "path";
import { transporter } from "../../configs/mail.config.js";

const emailAdmin = process.env.EMAIL_ADMIN;

const frUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const emailService = {
    sendWelcomeEmail: async (email, full_name, token) => {
        const templatePath = path.resolve('src/views/emails/welcome.ejs');
        const html = await ejs.renderFile(templatePath, {
            full_name: full_name,
            verify_url: `http://localhost:8080/api/v1/auth/token/${token}`
        });

        return await transporter.sendMail({
            from: `"Sport Nexus" ${emailAdmin}`,
            to: email,
            subject: "Chào mừng thành viên mới!",
            html: html
        });
    },

    sendResetPasswordEmail: async (email, full_name, token) => {
        const resetUrl = `${frUrl}/auth/dat-lai-mat-khau/${token}`;

        const templatePath = path.resolve('src/views/emails/forgot-password.ejs');
        const html = await ejs.renderFile(templatePath, {
            full_name: full_name,
            reset_url: resetUrl,
        });

        return await transporter.sendMail({
            from: `"Sport Nexus" ${emailAdmin}`,
            to: email,
            subject: "Đặt lại mật khẩu - Sport Nexus",
            html: html
        });
    },

    sendOrderConfirmationEmail: async (email, full_name, order, items, payment_method_label, status_label, payment_status_label) => {
        const templatePath = path.resolve('src/views/emails/order-confirmation.ejs');
        const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(Number(n || 0)) + '₫';
        const html = await ejs.renderFile(templatePath, {
            full_name,
            order,
            items,
            payment_method: payment_method_label,
            shipping_address: order.shipping_address,
            status_label,
            payment_status_label,
            payment_status: order.payment_status,
            formatPrice,
        });
        // console.log("OK")
        return await transporter.sendMail({
            from: `"Sport Nexus" ${emailAdmin}`,
            to: email,
            subject: `Xác nhận đơn hàng #${order.id} - Sport Nexus`,
            html,
        });
    },

    sendOrderStatusUpdateEmail: async (email, full_name, order, old_status_label, new_status_label, payment_method_label, payment_status_label) => {
        const templatePath = path.resolve('src/views/emails/order-status-update.ejs');
        const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(Number(n || 0)) + '₫';
        const html = await ejs.renderFile(templatePath, {
            full_name,
            order,
            old_status_label,
            new_status_label,
            payment_method: payment_method_label,
            payment_status_label,
            payment_status: order.payment_status,
            formatPrice,
        });

        return await transporter.sendMail({
            from: `"Sport Nexus" ${emailAdmin}`,
            to: email,
            subject: `Cập nhật trạng thái đơn hàng #${order.id} - Sport Nexus`,
            html,
        });
    }
};

export default emailService;