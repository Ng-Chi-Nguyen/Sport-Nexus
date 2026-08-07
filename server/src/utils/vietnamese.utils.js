const VIETNAMESE_MAP = {
    a: "áàảãạăắằẳẵặâấầẩẫậ",
    d: "đ",
    e: "éèẻẽẹêếềểễệ",
    i: "íìỉĩị",
    o: "óòỏõọôốồổỗộơớờởỡợ",
    u: "úùủũụưứừửữự",
    y: "ýỳỷỹỵ",
};

const buildReverseMap = () => {
    const map = {};
    for (const [plain, variants] of Object.entries(VIETNAMESE_MAP)) {
        map[plain] = plain;
        map[plain.toUpperCase()] = plain.toUpperCase();
        for (const ch of variants) map[ch] = plain;
    }
    return map;
};

const REVERSE = buildReverseMap();

export const normalizeVietnamese = (text = "") =>
    String(text)
        .toLowerCase()
        .split("")
        .map((ch) => REVERSE[ch] || ch)
        .join("")
        .replace(/\s+/g, " ")
        .trim();