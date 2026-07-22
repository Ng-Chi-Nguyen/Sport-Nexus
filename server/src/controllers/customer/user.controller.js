import { uploadImage } from "../../services/image/image.service.js";
import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";

const customerUserController = {
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await prisma.users.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                    avatar: true,
                    status: true,
                    is_verified: true,
                    role_id: true,
                    created_at: true,
                    updated_at: true,
                    role: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng."
                });
            }

            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thông tin người dùng.",
                error: error.message
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { full_name, phone_number } = req.body;

            const dataUpdate = {};
            if (full_name !== undefined) dataUpdate.full_name = full_name;
            if (phone_number !== undefined) dataUpdate.phone_number = phone_number;

            const updatedUser = await prisma.users.update({
                where: { id: userId },
                data: dataUpdate,
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                    avatar: true,
                }
            });

            return res.status(200).json({
                success: true,
                message: "Cập nhật thông tin thành công!",
                data: updatedUser
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi cập nhật thông tin.",
                error: error.message
            });
        }
    },

    uploadAvatar: async (req, res) => {
        try {
            const userId = req.user.id;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng chọn ảnh đại diện."
                });
            }

            await deleteImage(userId, "users", "avatar");

            const avatarUrl = await uploadImage.uploadAvatar(file.buffer, userId);

            const updatedUser = await prisma.users.update({
                where: { id: userId },
                data: { avatar: avatarUrl },
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                    avatar: true,
                }
            });

            return res.status(200).json({
                success: true,
                message: "Cập nhật ảnh đại diện thành công!",
                data: updatedUser
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi tải ảnh đại diện.",
                error: error.message
            });
        }
    }
};

export default customerUserController;
