import prisma from "../db/prisma.js"
import { uploadImage } from "../services/image.service.js";

export const deleteImage = async (recordId, modelName, fieldName) => {

    let dataToDelete = await prisma[modelName].findUnique({
        where: { id: recordId },
        select: { [fieldName]: true }
    });

    const fileUrl = dataToDelete ? dataToDelete[fieldName] : null;

    if (fileUrl) {
        const BUCKET_NAME = process.env.SUPABASE_GENERAL_BUCKET_NAME;

        if (!BUCKET_NAME) {
            console.error("Lỗi: SUPABASE_GENERAL_BUCKET_NAME chưa được cấu hình.");
            return;
        }

        await uploadImage.deleteFile(fileUrl, BUCKET_NAME);
    }
}