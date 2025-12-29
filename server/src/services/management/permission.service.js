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

    getAllRoleGroups: async () => {
        const permissions = await prisma.Permissions.findMany({
            orderBy: {
                module: 'asc'
            }
        });

        const groupedPermissions = permissions.reduce((acc, permission) => {
            const key = permission.module || 'others'; // Nếu module trống thì cho vào nhóm 'others'
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(permission);
            return acc;
        }, {});
        return groupedPermissions;
    },

    deleteRole: async (roleId) => {
        await prisma.Permissions.delete({
            where: { id: roleId }
        })
    },
}

export default permissionService;