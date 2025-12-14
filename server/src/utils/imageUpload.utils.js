import { supabase } from "../configs/supabase.config.js";
import sharp from "sharp";
const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;

export const uploadFileToSupabase = async (fileBuffer, folderPath, namePrefix) => {

    // 1. TỐI ƯU HÌNH ẢNH bằng SHARP (Logic tối ưu hóa giống hệt nhau)
    const optimizedBuffer = await sharp(fileBuffer)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

    // 2. Tạo đường dẫn và tên file duy nhất (Logic tạo tên giống hệt nhau)
    const fileExtension = 'webp';
    const fileName = `${namePrefix}_${Date.now()}.${fileExtension}`;
    const filePath = `${folderPath}/${fileName}`; // Chỉ thay đổi folderPath

    // 3. THỰC HIỆN UPLOAD lên Supabase Storage
    const { error } = await supabase.storage
        .from(GENERAL_BUCKET)
        .upload(filePath, optimizedBuffer, {
            contentType: `image/${fileExtension}`,
            upsert: true,
        });

    if (error) {
        throw new Error('Lỗi upload lên Supabase: ' + error.message);
    }

    // 4. Lấy URL công khai
    const { data: publicUrlData } = supabase.storage
        .from(GENERAL_BUCKET)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
};