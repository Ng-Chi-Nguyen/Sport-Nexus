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

        delete user.password;
        delete user.verification_token;

        return { user, accessToken };
    }
}

export default authService;