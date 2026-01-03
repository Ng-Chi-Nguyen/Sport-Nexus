import prisma from "../../db/prisma.js";
import bcrypt from "bcrypt";
import emailService from "../email/email.service.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";

const userService = {
    createUser: async (userData) => {
        const { full_name, email, password, phone_number, avatar } = userData;

        // console.log(full_name, email, password, phone_number, avatar)

        let password_hash = await bcrypt.hash(password, 10);
        let vToken = crypto.randomUUID();
        let newUser = await prisma.Users.create({
            data: {
                full_name: full_name,
                email: email,
                password: password_hash,
                phone_number: phone_number,
                avatar: avatar,
                status: true,
                verification_token: vToken,
                is_verified: false,
                role_id: 5,
            },
            select: {
                id: true,
                email: true,
                full_name: true,
                role_id: true,
            },
        });

        emailService.sendWelcomeEmail(email, full_name, vToken);

        await prisma.carts.create({
            data: {
                user_id: newUser.id
            }
        })

        return newUser;
    },

    updateUser: async (userId, dataUpdate) => {
        const { slug, ...restData } = dataUpdate;
        // console.log(slug)
        let updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                ...restData,
                role: slug ? {
                    connect: { slug: slug }
                } : undefined
            },
            select: {
                id: true,
                full_name: true,
                role_id: true,
                role: { select: { id: true, name: true, slug: true } }
            }
        });

        return updatedUser;
    },

    getUserById: async (userId) => {
        let [user] = await Promise.all([
            prisma.users.findUnique({
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
                    // 1. Lấy quyền từ Role (Quyền mặc định của chức vụ)
                    role: {
                        select: {
                            id: true,
                            slug: true,
                            name: true,
                            permissions: { // Thêm phần này để lấy danh sách quyền của Role
                                select: {
                                    id: true,
                                    module: true,
                                    action: true
                                }
                            }
                        }
                    },
                    // 2. Lấy quyền riêng của User (Extra permissions - nếu DB bạn có quan hệ này)
                    permissions: {
                        select: {
                            id: true,
                            module: true,
                            action: true
                        }
                    }
                },
            }),
        ])
        return { user };
    },

    getAllUser: async (page) => {
        const limit = 6;
        const currentPage = Math.max(1, page);
        // console.log(currentPage)
        const skip = (currentPage - 1) * limit;
        // console.log(skip)

        let [listUsers, totalItems, listPermissions] = await Promise.all([
            prisma.Users.findMany({
                take: limit,
                skip: skip,
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
                            name: true
                        }
                    }
                },
            }),
            prisma.Users.count(),
        ])

        return {
            data: listUsers,
            dataPermission: listPermissions,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    deleteUser: async (userId, currentUser) => {
        if (currentUser.avatar) {
            await deleteImage(userId, "users", "avatar");
        }
        await prisma.users.delete({
            where: { id: userId }
        })
    },

    updateUserPermissions: async (userId, permissionIds) => {
        return await prisma.users.update({
            where: { id: userId },
            data: {
                permissions: {
                    set: permissionIds.map(id => ({ id: id }))
                }
            },
            include: {
                permissions: true
            }
        });
    }
}

export default userService;
