import { uploadAvatar } from "../../services/image.service.js";
import userService from "../../services/management/user.service.js";

const userController = {
    createUser: async (req, res) => {
        let userData = req.body;
        // console.log(userData)
        try {
            let newUser = await userService.createUser(userData);

            return res.status(201).json({
                success: true,
                message:
                    "Tạo tài khoản thành công! Vui lòng kiểm tra email để xác minh.",
                data: newUser,
            });
        } catch (error) {
            if (error.code === "P2002") {
                return res.status(409).json({
                    success: false,
                    message: "Địa chỉ email này đã được đăng ký.",
                });
            }

            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    updateUser: async (req, res) => {
        let userId = parseInt(req.params.id);
        let dataUpdate = req.body;
        let file = req.file;
        console.log(file)


        try {

            if (file) {
                const avatarUrl = await uploadAvatar(file.buffer, userId);

                dataUpdate.avatar = avatarUrl;
            }

            let updateData = await userService.updateUser(userId, dataUpdate);

            return res.status(201).json({
                success: true,
                message: "Cập nhật thành công",
                data: updateData,
            });

        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    getUserById: async (req, res) => {
        let userId = parseInt(req.params.id);

        try {
            let dataUser = await userService.dataUser(userId);

            return res.status(201).json({
                success: true,
                data: dataUser,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    getAllUser: async (req, res) => {
        try {
            let listUsers = await userService.dataUsers();

            return res.status(201).json({
                success: true,
                data: listUsers,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    deleteUserById: async (req, res) => {
        let userId = parseInt(req.params.id);

        try {
            await userService.deleteUser(userId);

            return res.status(201).json({
                success: true,
                message: "Người dụng đã được xóa khỏi hệ thống",
            });
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy người dùng trong hệ thống.",
                });
            }

            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    }
};

export default userController;
