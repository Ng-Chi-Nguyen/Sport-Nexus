import slugify from "slugify";
import prisma from "../db/prisma.js";

export const createAutoSlug = async (name, model) => {
    let baseSlug = slugify(name, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        strict: true,
        locale: 'vi',
    })

    let slug = baseSlug;

    let maxRepeat = 5;
    for (let i = 1; i <= maxRepeat; i++) {
        let existingRecord = await prisma[model].findUnique({
            where: { slug: slug }
        });

        if (!existingRecord) {
            return slug; // Slug duy nhất đã được tìm thấy, trả về ngay
        }

        let counter = i + 1;

        if (i > 0) {
            // Ví dụ: ao-the-thao-1, ao-the-thao-2
            slug = `${baseSlug}-${counter}`;
        }
    }

    let timeHash = Date.now().toString().slice(-6);
    console.warn(`[SLUG WARNING] Slug "${baseSlug}" bị trùng 5 lần. Sử dụng fallback Timestamp.`);


    return `${baseSlug}-${timeHash}`;
}