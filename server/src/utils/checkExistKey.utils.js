import prisma from "../db/prisma.js";

export const checkExistKey = async (key, value, model) => {
    if (!value || typeof value !== 'number' || value <= 0) {
        throw new Error(`${value} không hợp lệ.`);
    }

    const userExists = await prisma[model].findUnique({
        where: { [key]: value },
        select: { [key]: true }
    });

    if (!userExists) {
        throw new Error(`${value} không tồn tại.`);
    }
};