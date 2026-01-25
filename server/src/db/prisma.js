import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("Database: Đã kết nối thành công với MySQL!");
    } catch (error) {
        console.error("Database: LỖI KẾT NỐI CSDL:", error.message);
    }
}

export default prisma;