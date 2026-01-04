import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        }

        const secret = process.env.JWT_ACCESS_SECRET;
        const decoded = jwt.verify(token, secret);
        console.log(secret)
        console.log(decoded)

        // 3. Truy vấn User dựa trên Schema của bạn
        const user = await prisma.Users.findUnique({
            where: { id: decoded.id },
            include: {
                role: true,         // Lấy thông tin Role (vì bạn có role_id)
                permissions: true   // Lấy THẲNG mảng Permissions (vì là Many-to-Many ẩn)
            }
        });

        console.log(user)

        if (!user) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        // 4. Trích xuất mảng SLUG (Sử dụng trực tiếp trường slug từ model Permissions)
        const userPermissionSlugs = user.permissions.map(p => p.slug);

        // 5. Gán dữ liệu vào req.user để dùng cho checkPermission
        req.user = {
            ...user,
            permissionSlugs: userPermissionSlugs
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Chỉ trả về đúng mã này để Frontend tự gọi hàm refreshToken của bạn
            return res.status(401).json({
                message: "Access token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(403).json({ message: "Token không hợp lệ" });
    }
};

export const checkPermission = (requiredSlug) => {
    return (req, res, next) => {
        const userPermissionSlugs = req.user.permissionSlugs || [];

        // Log để bạn soi khi test User 43
        console.log(`>>> [AUTH] Yêu cầu: ${requiredSlug} | User có: [${userPermissionSlugs}]`);

        if (!userPermissionSlugs.includes(requiredSlug)) {
            return res.status(403).json({
                message: `Bạn không có quyền thực hiện hành động này (${requiredSlug})`
            });
        }
        next();
    };
};

const handleGenerateAndSendNewCode = async (email) => {
    const newCode = Math.floor(100000 + Math.random() * 900000); // Tạo mã 6 số
    const expiry = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

    // Cập nhật vào Database (Ví dụ dùng Mongoose/Sequelize)
    await User.updateOne({ email }, {
        verificationCode: newCode,
        codeExpiredAt: expiry
    });

    // Gọi hàm gửi mail của bạn
    await sendEmail(email, "Mã xác thực mới", `Mã của bạn là: ${newCode}`);

    return newCode;
};