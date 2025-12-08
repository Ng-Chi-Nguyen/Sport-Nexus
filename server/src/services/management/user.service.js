import prisma from "../../db/prisma.js";
import bcrypt from "bcrypt";

const userService = {
    createUser: async (userData) => {
        const { full_name, email, password, phone_number, avatar } = userData;

        // console.log(full_name, email, password, phone_number, avatar)

        let password_hash = await bcrypt.hash(password, 10);

        let newUser = await prisma.Users.create({
            data: {
                full_name: full_name,
                email: email,
                password: password_hash,
                phone_number: phone_number,
                avatar: avatar,
                status: true,
                is_verified: false,
                role_id: 3,
            },
            select: {
                id: true,
                email: true,
                full_name: true,
                role_id: true,
            },
        });

        return newUser;
    },

    updateUser: async (userId, dataUpdate) => {
        let updateUser = await prisma.users.update({
            where: { id: userId },
            data: dataUpdate,
            select: {
                id: true,
                full_name: true,
                email: true,
                phone_number: true,
                status: true,
                role_id: true,
                updated_at: true,
            },
        });

        return updateUser;
    },

    dataUser: async (userId) => {
        let user = await prisma.users.findUnique({
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
            },
        });
        return user;
    },

    dataUsers: async () => {
        let listUsers = await prisma.users.findMany({
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
            },
        });
        return listUsers;
    },

    deleteUser: async (userId) => {
        await prisma.users.delete({
            where: { id: userId }
        })
    }
};

export default userService;
