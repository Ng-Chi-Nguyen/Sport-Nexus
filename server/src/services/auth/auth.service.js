import prisma from "../../db/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import emailService from "../email/email.service.js";
import { ACTIVE } from "../../utils/prisma.js";
import { OAuth2Client } from "google-auth-library";

const authService = {
    login: async (dataLogin) => {
        let { username, password } = dataLogin;
        // console.log(dataLogin)
        let user = await prisma.Users.findFirst({
            where: {
                deleted_at: ACTIVE,
                OR: [
                    { email: username },
                    { phone_number: username }
                ]
            },
            include: {
                role: true
            }
        })
        // console.log("user: ", user)
        if (!user) {
            let error = new Error("Tài khoản không tồn tại");
            error.status = 404;
            throw error;
        }

        if (user.status === false) {
            let error = new Error("Tài khoản đã bị khóa");
            error.status = 403;
            throw error;
        };

        let isMatch = bcrypt.compareSync(password, user.password)

        if (!isMatch) {
            let error = new Error("Mật khẩu - Email - Số điện thoại không chính xác");
            error.status = 401;
            throw error;
        }

        // Tạo JWT
        const accessToken = jwt.sign(
            { id: user.id, role: user.role.slug, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        const refresh_token = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        await prisma.Users.update({
            where: { id: user.id },
            data: { refresh_token: refresh_token }
        });

        delete user.password;
        delete user.verification_token;
        user.refresh_token = refresh_token;

        return { user, accessToken };
    },

    logout: async (userId) => {
        await prisma.Users.update({
            where: { id: Number(userId) },
            data: {
                refresh_token: null,
                updated_at: new Date()
            }
        });
    },

    verifyAccount: async (token) => {
        const user = await prisma.Users.findFirst({
            where: { verification_token: token },
        })

        if (!user) {
            return `Không tìm thấy User`;
        }

        const updatedUser = await prisma.Users.update({
            where: { id: user.id },
            data: {
                verification_token: null,
                is_verified: true
            }
        })

        return updatedUser;
    },

    forgotPassword: async (email) => {
        const user = await prisma.Users.findFirst({
            where: { email, deleted_at: ACTIVE },
        });

        if (!user) {
            const error = new Error("Email không tồn tại trong hệ thống");
            error.status = 404;
            throw error;
        }

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.Users.update({
            where: { id: user.id },
            data: { verification_token: token },
        });

        await emailService.sendResetPasswordEmail(user.email, user.full_name, token);
    },

    resetPassword: async (token, { password }) => {
        const user = await prisma.Users.findFirst({
            where: { verification_token: token, deleted_at: ACTIVE },
        });

        if (!user) {
            const error = new Error("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
            error.status = 400;
            throw error;
        }

        const password_hash = await bcrypt.hash(password, 10);

        await prisma.Users.update({
            where: { id: user.id },
            data: {
                password: password_hash,
                verification_token: null,
            },
        });
    },

    changePassword: async (userId, { current_password, new_password }) => {
        const user = await prisma.Users.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            const error = new Error("Tài khoản không tồn tại");
            error.status = 404;
            throw error;
        }

        const isMatch = bcrypt.compareSync(current_password, user.password);
        if (!isMatch) {
            const error = new Error("Mật khẩu hiện tại không chính xác");
            error.status = 400;
            throw error;
        }

        const password_hash = await bcrypt.hash(new_password, 10);

        await prisma.Users.update({
            where: { id: Number(userId) },
            data: {
                password: password_hash,
                updated_at: new Date(),
            },
        });
    },

    googleLogin: async (token) => {
        const client = new OAuth2Client();
        client.setCredentials({ access_token: token });
        const userInfoRes = await client.request({
            url: "https://www.googleapis.com/oauth2/v3/userinfo"
        });

        const { email, name, picture } = userInfoRes.data;

        if (!email) {
            const error = new Error("Không thể lấy email từ tài khoản Google");
            error.status = 400;
            throw error;
        }

        let user = await prisma.Users.findFirst({
            where: { email, deleted_at: ACTIVE },
            include: { role: true }
        });

        if (!user) {
            const customerRole = await prisma.Roles.findUnique({
                where: { slug: "customer" }
            });

            if (!customerRole) {
                const error = new Error("Không tìm thấy vai trò mặc định");
                error.status = 500;
                throw error;
            }

            const fakePassword = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);

            user = await prisma.Users.create({
                data: {
                    full_name: name || email.split("@")[0],
                    email,
                    password: fakePassword,
                    avatar: picture || null,
                    role_id: customerRole.id,
                    is_verified: true,
                    status: true,
                },
                include: { role: true }
            });
        }

        if (user.status === false) {
            const error = new Error("Tài khoản đã bị khóa");
            error.status = 403;
            throw error;
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.role.slug, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        const refresh_token = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        await prisma.Users.update({
            where: { id: user.id },
            data: { refresh_token }
        });

        delete user.password;
        delete user.verification_token;
        user.refresh_token = refresh_token;

        return { user, accessToken };
    },

    refreshToken: async (refreshToken) => {
        if (!refreshToken) {
            throw { status: 401, message: "Không có Refresh Token" };
        }

        try {
            // 1. Giải mã Refresh Token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // 2. Tìm User và so khớp token trong DB
            const user = await prisma.Users.findUnique({
                where: { id: decoded.id },
            });

            if (!user || user.refresh_token !== refreshToken) {
                throw { status: 403, message: "Refresh Token không hợp lệ hoặc đã bị thu hồi" };
            }

            // 3. Tạo Access Token mới (Thời gian sống 15 phút)
            const newAccessToken = jwt.sign(
                {
                    id: user.id,
                    role: user.role_id,
                    email: user.email
                },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: "15m" }
            );

            return { accessToken: newAccessToken };

        } catch (error) {
            // Nếu lỗi do jwt.verify (hết hạn 7 ngày)
            if (error.name === "TokenExpiredError") {
                const payload = jwt.decode(refreshToken);

                if (payload && payload.id) {
                    await prisma.Users.update({
                        where: { id: payload.id },
                        data: { refresh_token: null }
                    });
                    console.log(`>>> Đã xóa Refresh Token hết hạn của User ID: ${payload.id}`);
                }

                throw { status: 403, message: "Phiên đăng nhập đã hết hạn hoàn toàn. Vui lòng đăng nhập lại." };
            }

            throw { status: 403, message: "Token không hợp lệ" };
        }
    },
}

export default authService;