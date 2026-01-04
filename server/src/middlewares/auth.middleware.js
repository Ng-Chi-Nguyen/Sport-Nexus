export const checkPermission = (requiredSlug) => {
    return (req, res, next) => {
        const userPermissionSlugs = req.user.permissionSlugs; // ['USER_CREATE', ...]

        // So sánh bằng chữ, cực kỳ an toàn và dễ đọc
        if (!userPermissionSlugs.includes(requiredSlug)) {
            return res.status(403).json({ message: "Bạn không có quyền này!" });
        }

        next();
    };
};