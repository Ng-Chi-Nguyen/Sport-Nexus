import slugify from "slugify";
import prisma from "../db/prisma.js";
import { ACTIVE } from "./prisma.js";

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
        let existingRecord = await prisma[model].findFirst({
            where: { slug: slug, deleted_at: ACTIVE }
        });

        if (!existingRecord) {
            return slug;
        }

        let counter = i + 1;

        if (i > 0) {
            slug = `${baseSlug}-${counter}`;
        }
    }

    let timeHash = Date.now().toString().slice(-6);
    console.warn(`[SLUG WARNING] Slug "${baseSlug}" bị trùng 5 lần. Sử dụng fallback Timestamp.`);

    return `${baseSlug}-${timeHash}`;
}