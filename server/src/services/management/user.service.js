import prisma from "../../db/prisma.js";
import bcrypt from "bcrypt";
import emailService from "../email/email.service.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { ACTIVE } from "../../utils/prisma.js";

const userService = {
    createUser: async (userData) => {
        const { full_name, email, password, phone_number, avatar, slug } = userData;
        const roleExists = await prisma.Roles.findUnique({
            where: { slug: slug }
        });
        // console.log(roleExists)
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
                role: {
                    connect: { id: roleExists.id } // Connect bằng ID vừa tìm được cho chắc chắn
                }
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

        if (dataUpdate.avatar)
            await deleteImage(userId, "users", "avatar");
        // console.log(updatedUser)
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

    getAllUser: async ({ page, search, status, is_verified, role_id, date_from, date_to, include_deleted } = {}) => {
        const limit = 6;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        let where = { deleted_at: ACTIVE };
        if (include_deleted) delete where.deleted_at;

        if (search) {
            where.OR = [
                { full_name: { contains: search } },
                { email: { contains: search } },
                { phone_number: { contains: search } },
            ];
        }

        if (status !== undefined && status !== '') {
            where.status = status === 'true' || status === true;
        }

        if (is_verified !== undefined && is_verified !== '') {
            where.is_verified = is_verified === 'true' || is_verified === true;
        }

        if (role_id) where.role_id = Number(role_id);

        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) where.created_at.gte = new Date(date_from);
            if (date_to) where.created_at.lte = new Date(date_to + "T23:59:59.999Z");
        }

        let [listUsers, totalItems] = await Promise.all([
            prisma.Users.findMany({
                where,
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
                orderBy: { id: "desc" }
            }),
            prisma.Users.count({ where }),
        ])

        return {
            data: listUsers,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: currentPage,
                itemsPerPage: limit
            }
        };
    },

    getRolesDropdown: async () => {
        return await prisma.Roles.findMany({
            select: { id: true, name: true }
        });
    },

    deleteUser: async (userId, currentUser) => {
        await prisma.users.update({
            where: { id: userId },
            data: { deleted_at: new Date() }
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
