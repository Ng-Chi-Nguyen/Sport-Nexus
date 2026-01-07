import prisma from "../db/prisma.js"
import { uploadImage } from "../services/image/image.service.js";

export const deleteImage = async (recordId, modelName, fieldName) => {
    console.log("ok", fieldName)
    console.log("ok", recordId)
    console.log("ok", modelName)
    let dataToDelete = await prisma[modelName].findUnique({
        where: { id: recordId },
        select: { [fieldName]: true }
    });

    console.log(dataToDelete)

    const fileUrl = dataToDelete?.[fieldName] ?? null;

    if (fileUrl) {
        console.log("OK đã vô đây")
        const BUCKET_NAME = process.env.SUPABASE_GENERAL_BUCKET_NAME;

        if (!BUCKET_NAME) {
            console.error("Lỗi: SUPABASE_GENERAL_BUCKET_NAME chưa được cấu hình.");
            return;
        }

        await uploadImage.deleteFile(fileUrl, BUCKET_NAME);
    }
}