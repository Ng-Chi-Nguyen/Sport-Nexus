import roleService from "../../services/management/role.service.js";

const roleController = {
    createRole: async (req, res) => {
        let dataRole = req.body;
        try {
            let newRole = await roleService.createRole(dataRole);
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
            let updateRole = await roleService.updateRole(roleId, dataUpdate);
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
            let role = await roleService.getRoleById(roleId);
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
            let roles = await roleService.getAllRole();
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
            let groupedRoles = await roleService.getAllRoleGroups();
            if (!groupedRoles || Object.keys(groupedRoles).length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy quyền nào được thiết lập."
                });
            }
            return res.status(200).json({
                success: true,
                data: groupedRoles
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

    deleteRole: async (req, res) => {
        let roleId = parseInt(req.params.id)
        try {
            let roles = await roleService.deleteRole(roleId);
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

export default roleController;