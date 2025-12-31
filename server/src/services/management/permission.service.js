import prisma from "../../db/prisma.js";
import { createAutoSlug } from "../../utils/slug.utils.js";

const permissionService = {
    createRole: async (dataRole) => {
        let { name, module, action } = dataRole;
        let slug = await createAutoSlug(name, "Permissions")
        let newRole = await prisma.Permissions.create({
            data: {
                name: name,
                slug: slug,
                module: module,
                action: action
            }
        })
        return newRole
    },

    updateRole: async (roleId, dataUpdate) => {
        if (dataUpdate.name) {
            let slug = await createAutoSlug(dataUpdate.name, "Permissions")
            dataUpdate.slug = slug;
        }
        let updateRole = await prisma.Permissions.update({
            where: { id: roleId },
            data: dataUpdate
        })
        return updateRole;
    },

    updatePermissionBySlug: async (permissionSlug, dataUpdate) => {
        console.log(permissionSlug)
        if (dataUpdate.name) {
            let slug = await createAutoSlug(dataUpdate.name, "Permissions")
            dataUpdate.slug = slug;
        }
        let updateRole = await prisma.Permissions.update({
            where: { slug: permissionSlug },
            data: dataUpdate
        })
        return updateRole;
    },

    getRoleById: async (roleId) => {
        let role = await prisma.Permissions.findUnique({
            where: { id: roleId },
        })
        return role;
    },

    getRoleBySlug: async (roleSlug) => {
        // console.log(roleSlug)
        let role = await prisma.Permissions.findUnique({
            where: { slug: roleSlug },
        })
        return role;
    },

    getAllRole: async () => {
        let roles = await prisma.Permissions.findMany()
        return roles;
    },

    getAllRoleGroups: async (page = 1) => {
        try {
            const limit = 6;
            const currentPage = Math.max(1, parseInt(page) || 1); // Đảm bảo page luôn là số dương
            const skip = (currentPage - 1) * limit; // Công thức: $skip = (page - 1) \times limit$

            // 1. Lấy dữ liệu và tổng số bản ghi đồng thời
            const [permissions, totalItems] = await Promise.all([
                prisma.Permissions.findMany({
                    take: limit,
                    skip: skip,
                    orderBy: { module: 'asc' }
                }),
                prisma.Permissions.count()
            ]);

            // 2. Nhóm dữ liệu theo module
            const groupedPermissions = permissions.reduce((acc, permission) => {
                const key = permission.module || 'others';
                if (!acc[key]) acc[key] = [];
                acc[key].push(permission);
                return acc;
            }, {});

            // 3. Trả về đúng cấu trúc, tuyệt đối không dùng dấu { ... }
            return {
                data: groupedPermissions,
                pagination: {
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                    currentPage: currentPage,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            throw new Error("Service Error: " + error.message);
        }
    },

    deleteRole: async (roleId) => {
        await prisma.Permissions.delete({
            where: { id: roleId }
        })
    },

    deleteBySlug: async (slug) => {
        await prisma.Permissions.delete({
            where: { slug: slug }
        })
    },
}

export default permissionService;