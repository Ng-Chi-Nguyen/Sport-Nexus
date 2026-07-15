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
        // console.log(secret)
        // console.log(decoded)

        // 3. Truy vấn User dựa trên Schema của bạn
        const user = await prisma.Users.findUnique({
            where: { id: decoded.id },
            include: {
                role: true,         // Lấy thông tin Role (vì bạn có role_id)
                permissions: true   // Lấy THẲNG mảng Permissions (vì là Many-to-Many ẩn)
            }
        });

        // console.log(user)

        if (!user) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        // 4. Trích xuất mảng SLUG (Sử dụng trực tiếp trường slug từ model Permissions)
        const userPermissionSlugs = user.permissions.map(p => p.slug); // CHuyển Obj -> Arr string ["them-nguoi-dung", "xem-bao-cao"]

        //  Gán dữ liệu vào req.user để dùng cho checkPermission
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
        // console.log(`>>> [AUTH] Yêu cầu: ${requiredSlug} | User có: [${userPermissionSlugs}]`);

        if (!userPermissionSlugs.includes(requiredSlug)) {
            return res.status(403).json({
                message: `Bạn không có quyền (${requiredSlug})`
            });
        }
        next();
    };
};


export const isAdmin = (req, res, next) => {
    // 1. Kiểm tra xem dữ liệu user đã được nạp từ verifyToken chưa
    if (!req.user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }
    // 2. Lấy thông tin role (do trong verifyToken bạn đã include: { role: true })
    const roleSlug = req.user.role?.slug;
    const roleName = req.user.role?.name;
    // console.log(req.user.role)
    // console.log(userRole)

    // 3. Kiểm tra xem có đúng là Admin hay không
    // Bạn hãy check lại database xem tên chính xác là "QUẢN TRỊ VIÊN", "Admin" hay "admin" nhé
    if (roleSlug === "admin" || roleName === "Quản trị viên") {
        return next(); // Đúng admin -> Cho qua để vào controller
    }

    // 4. Nếu là Nhân viên -> Chặn lại trả về 403
    return res.status(403).json({
        message: "Từ chối truy cập. Chỉ có Quản trị viên mới có quyền thực hiện hành động này!"
    });
};
