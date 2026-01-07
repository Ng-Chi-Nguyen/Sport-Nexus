import permissionService from "../../services/management/permission.service.js";

const permissionController = {
    createRole: async (req, res) => {
        let dataRole = req.body;
        console.log(dataRole)
        try {
            let newRole = await permissionService.createRole(dataRole);
            return res.status(201).json({
                success: true,
                message: "Quyền đã được thêm",
                data: newRole
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message
            });
        }
    },

    updateRole: async (req, res) => {
        let roleId = parseInt(req.params.id)
        let dataUpdate = req.body;
        try {
            let updateRole = await permissionService.updateRole(roleId, dataUpdate);
            return res.status(201).json({
                success: true,
                message: "Quyền đã được thêm",
                data: updateRole
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },

    updatePermissionBySlug: async (req, res) => {
        let permissionSlug = (req.params.slug)
        let dataUpdate = req.body;
        try {
            let updateRole = await permissionService.updatePermissionBySlug(permissionSlug, dataUpdate);
            return res.status(201).json({
                success: true,
                message: "Quyền đã được thêm",
                data: updateRole
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },


    getRoleById: async (req, res) => {
        let roleId = parseInt(req.params.id)
        try {
            let role = await permissionService.getRoleById(roleId);
            if (!role || role.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy quyền."
                });
            }
            return res.status(200).json({
                success: true,
                data: role
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },

    getRoleBySlug: async (req, res) => {
        let roleSlug = (req.params.slug)
        try {
            let role = await permissionService.getRoleBySlug(roleSlug);
            if (!role || role.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy quyền."
                });
            }
            return res.status(200).json({
                success: true,
                data: role
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },

    getAllRole: async (req, res) => {
        try {
            let roles = await permissionService.getAllRole();
            if (!roles || roles.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy quyền."
                });
            }
            return res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },

    getAllRoleGroups: async (req, res) => {
        try {
            // 1. Phải lấy từ req.query vì Frontend gửi qua URL (?page=1)
            // Thêm parseInt và kiểm tra nếu không phải số thì mặc định là 1
            const page = parseInt(req.query.page) || 1;

            const result = await permissionService.getAllRoleGroups(page);

            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error("Backend Error:", error); // Log ra terminal để debug
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteRole: async (req, res) => {
        let roleId = parseInt(req.params.id)
        try {
            await permissionService.deleteRole(roleId);
            return res.status(200).json({
                success: true,
                message: "Quyền đã được xóa"
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },

    deleteBySlug: async (req, res) => {
        let slug = (req.params.slug)
        try {
            await permissionService.deleteBySlug(slug);
            return res.status(200).json({
                success: true,
                message: "Quyền đã được xóa"
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Không tìm thấy quyền." });
            }
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ",
                error: error.message,
            });
        }
    },
}

export default permissionController;