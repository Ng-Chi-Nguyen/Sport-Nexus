import prisma from "../../db/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authService = {
    login: async (dataLogin) => {
        let { username, password } = dataLogin;
        // console.log(dataLogin)
        let user = await prisma.Users.findFirst({
            where: {
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
            process.env.JWT_ACCESS_SECRET,
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
    }
}

export default authService;