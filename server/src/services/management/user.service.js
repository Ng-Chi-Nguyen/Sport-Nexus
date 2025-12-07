import prisma from "../../db/prisma.js";
import bcrypt from 'bcrypt';

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
            }
        })

        return newUser
    }
}

export default userService;