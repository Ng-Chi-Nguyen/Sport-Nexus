import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";
import { normalizeVietnamese } from "../../utils/vietnamese.utils.js";
import { FAQS, ADMIN_GUIDES } from "./faq.js";

const ORDER_STATUS_LABELS = {
    Processing: "Chuẩn bị hàng",
    Shipping: "Đang giao",
    Delivered: "Đã giao",
    Cancelled: "Đã hủy",
    Refunded: "Hoàn tiền",
};

const formatMoney = (n) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0));
const hasAnyKeyword = (norm, keywords) => keywords.some((k) => norm.includes(k));

// Các từ khoá small-talk / chào hỏi (đã bỏ dấu). Ưu tiên xử lý TRƯỚC để trả lời tự nhiên.
const GREETING_KEYWORDS = ["xin chao", "chao", "hello", "hi", "alo", "hey", "chao ban", "chao em"];
const THANKS_KEYWORDS = ["cam on", "thanks", "thank", "thank you", "cam on ban", "cam on nhieu"];
const BYE_KEYWORDS = ["tam biet", "bye", "hen gap", "gap lai", "goodbye"];
const HELP_KEYWORDS = ["giup", "help", "tro giup", "ban lam duoc gi", "lam gi duoc", "bat dau", "huong dan su dung"];

// Trích giá tiền từ câu, tránh gộp nhầm số đếm (vd "1 đôi") thành giá.
// Ưu tiên số có đơn vị (k/nghìn/triệu/tr/củ); nếu không có thì nhận số >= 3 chữ số.
const parsePrice = (text) => {
    const norm = normalizeVietnamese(text);
    const withUnit = norm.match(/(\d+)\s*(k|nghin|trieu|tr|cu)/g);
    if (withUnit && withUnit.length) {
        const vals = withUnit.map((w) => {
            const [, n, u] = w.match(/(\d+)\s*(k|nghin|trieu|tr|cu)/);
            const num = Number(n);
            if (u === "k" || u === "nghin") return num * 1000;
            return num * 1000000;
        });
        return Math.min(...vals);
    }
    const bare = norm.match(/\d{3,}/g);
    if (bare && bare.length) return Math.min(...bare.map(Number));
    return 0;
};

// Các intent thật, dùng regex word-boundary (sau normalize toàn ASCII) để tránh false-positive
// như "ao" match nhầm trong "chao". Từ ngắn (<=3 ký tự) phải đứng riêng; cụm từ dùng substring.
const REAL_INTENT_REGEX = [
    /\bgia\b/, /\bgiay\b/, /\bao\b/, /\bquan\b/, /\bsan pham\b/, /\bmua\b/,
    /\bdon hang\b/, /\border\b/, /\bkhuyen mai\b/, /\bgiam gia\b/, /\bcoupon\b/,
    /\bgiao hang\b/, /\bdoi tra\b/, /\bthanh toan\b/, /\bthanh toan\b/, /\bbao hanh\b/,
    /\bkhach\b/, /\bgiay the thao\b/, /\bvali\b/, /\bbalo\b/, /\bnike\b/, /\badidas\b/,
];

// Nhận diện small-talk đơn thuần: nếu câu chỉ gồm lời chào/cảm ơn/tạm biệt thì trả lời ngay,
// không lãng phí query DB tìm sản phẩm hay rơi vào fallback.
const isPureSmallTalk = (norm, keywords) => {
    if (!hasAnyKeyword(norm, keywords)) return false;
    // Nếu câu còn chứa ý định thật (sản phẩm, đơn hàng, khuyến mãi, giao hàng...) thì không coi là small-talk
    if (REAL_INTENT_REGEX.some((re) => re.test(norm))) return false;
    const tokens = norm.split(" ").filter(Boolean);
    return tokens.length <= 6;
};

const handleSmallTalk = (norm) => {
    if (hasAnyKeyword(norm, GREETING_KEYWORDS)) {
        return "Xin chào! 👋 Mình là trợ lý của SportNexus. Bạn muốn tìm sản phẩm, tra cứu đơn hàng, hay cần hỗ trợ gì về đơn hàng - thanh toán - đổi trả?";
    }
    if (hasAnyKeyword(norm, THANKS_KEYWORDS)) {
        return "Không có gì đâu ạ! 😊 Nếu cần thêm hỗ trợ gì, cứ nhắn mình nhé.";
    }
    if (hasAnyKeyword(norm, BYE_KEYWORDS)) {
        return "Cảm ơn bạn đã ghé SportNexus! Chúc bạn một ngày tốt lành 👋. Cần gì cứ nhắn mình nha.";
    }
    if (hasAnyKeyword(norm, HELP_KEYWORDS)) {
        return "Mình có thể giúp bạn:\n\n• 🔍 Tìm kiếm sản phẩm (vd: \"giày thể thao\")\n• 📦 Tra cứu đơn hàng theo mã hoặc email\n• 🎟️ Xem mã giảm giá / khuyến mãi\n• 📖 Hỏi về giao hàng, thanh toán, đổi trả, bảo hành";
    }
    return null;
};

// Stop-word tiếng Việt (đã bỏ dấu) — loại bỏ khi trích từ khóa tìm kiếm sản phẩm
const STOP_WORDS = new Set([
    "toi", "minh", "ban", "em", "tui", "nguoi", "ta", "hay", "xin", "vui",
    "lam", "cho", "con", "neu", "ma", "la", "cua", "va", "voi", "hoac",
    "hay", "nay", "do", "kia", "thoi", "ra", "len", "xuong", "la", "o",
    "mot", "moi", "co", "khong", "duoc", "muon", "can", "tim", "go", "muon",
    "qua", "rat", "that", "ung", "de", "nhe", "a", "nha", "khach", "ong", "ba",
    "chi", "anh", "me", "bo", "de", "ve", "theo", "ve", "tao", "tui",
]);

// Trích danh sách từ khóa đáng tìm từ câu người dùng, loại bỏ stop-word và từ vô nghĩa
const extractKeywords = (norm) => {
    const tokens = norm.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
    return [...new Set(tokens.filter((t) => t.length >= 2 && !STOP_WORDS.has(t)))];
};

const searchProducts = async (query) => {
    const norm = normalizeVietnamese(query);
    const num = parsePrice(norm);
    const where = { is_active: true, deleted_at: ACTIVE };
    if (num > 0 && ["gia", "duoi", "tren", "khoang", "tu", "den", "k", "trieu", "tr", "cu", "nghin", "re"].some((k) => norm.includes(k))) {
        where.ProductVariants = { some: { deleted_at: ACTIVE, price: { lte: num } } };
    }
    const keywords = extractKeywords(norm);
    if (keywords.length > 0) {
        // Khớp linh hoạt: sản phẩm chứa bất kỳ từ khóa nào trong danh sách
        where.OR = keywords.map((k) => ({ name: { contains: k } }));
    }

    const products = await prisma.Products.findMany({
        where,
        select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            ProductVariants: { select: { price: true }, orderBy: { price: "asc" }, take: 1 }
        },
        take: 5
    });
    return products.map((p) => ({
        type: "product",
        title: p.name,
        subtitle: `Giá từ ${formatMoney(p.ProductVariants[0]?.price)}đ`,
        image: p.thumbnail,
        link: `/san-pham/${p.slug}`
    }));
};

const lookupOrder = async (user, raw) => {
    const orderId = Number(raw.trim().replace(/\D/g, ""));
    const isEmail = raw.includes("@");
    if (isEmail) {
        const order = await prisma.Orders.findFirst({
            where: { user_email: raw.trim(), user_id: user?.id },
            orderBy: { created_at: "desc" },
            take: 1,
        });
        if (!order) return { reply: "Không tìm thấy đơn hàng cho email này.", items: [] };
        return {
            reply: `Đơn gần nhất: #${order.id} — ${ORDER_STATUS_LABELS[order.status] || order.status}, tổng ${formatMoney(order.final_amount)}đ.`,
            items: [],
        };
    }
    if (!Number.isFinite(orderId) || orderId <= 0) {
        return { reply: "Vui lòng cung cấp mã đơn hàng hợp lệ hoặc email của bạn.", items: [] };
    }
    const order = await prisma.Orders.findUnique({ where: { id: orderId } });
    if (!order) return { reply: `Không tìm thấy đơn hàng #${orderId}.`, items: [] };
    if (user && user.role?.slug !== "admin" && order.usersId !== user.id) {
        return { reply: "Bạn chỉ có thể xem đơn hàng của chính mình.", items: [] };
    }
    return {
        reply: `Đơn #${order.id}: trạng thái ${ORDER_STATUS_LABELS[order.status] || order.status}, tổng ${formatMoney(order.final_amount)}đ.`,
        items: [],
    };
};

const listPromotions = async () => {
    const now = new Date();
    const coupons = await prisma.Coupons.findMany({
        where: { is_active: true, deleted_at: ACTIVE, start_date: { lte: now }, end_date: { gte: now } },
        select: { code: true, discount_value: true, discount_type: true, min_order_value: true },
        take: 5,
    });
    if (!coupons.length) return { reply: "Hiện chưa có mã giảm giá nào.", items: [] };
    return {
        reply: "Các mã giảm giá đang hoạt động:",
        items: coupons.map((c) => ({
            type: "coupon",
            title: c.code,
            subtitle: c.discount_type === "PERCENTAGE" ? `Giảm ${c.discount_value}%` : `Giảm ${formatMoney(c.discount_value)}đ`,
        })),
    };
};

const getStats = async (norm) => {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const month = now.toISOString().slice(0, 7);
    let from = new Date(`${day}T00:00:00.000Z`);
    let label = "hôm nay";
    if (norm.includes("thang")) {
        from = new Date(`${month}-01T00:00:00.000Z`);
        label = `tháng ${month}`;
    }

    const orders = await prisma.Orders.findMany({ where: { created_at: { gte: from } }, select: { final_amount: true, status: true } });
    const revenue = orders.reduce((s, o) => s + Number(o.final_amount || 0), 0);
    const delivered = orders.filter((o) => o.status === "Delivered").length;

    return {
        reply: `📊 Thống kê ${label}: Tổng ${orders.length} đơn, doanh thu ${formatMoney(revenue)}đ, ${delivered} đơn đã giao.`,
        items: [],
    };
};

const getBusinessAdvice = async () => {
    const lowStock = await prisma.ProductVariants.findMany({
        where: { deleted_at: ACTIVE, stock: { lte: 10 } },
        select: { stock: true, product: { select: { name: true } } },
        orderBy: { stock: "asc" },
        take: 3,
    });
    return {
        reply: lowStock.length ? `📦 Gợi ý nhập hàng (tồn kho thấp): ${lowStock.map(v => `${v.product.name} (còn ${v.stock})`).join(", ")}.` : "Tồn kho hiện tại đang ổn định.",
        items: [],
    };
};

const ADMIN_ACTIONS = [
    { type: "action", title: "📊 Thống kê hôm nay", command: "thống kê hôm nay" },
    { type: "action", title: "🔥 Sản phẩm bán chạy", command: "sản phẩm bán chạy" },
    { type: "action", title: "📦 Gợi ý nhập hàng", command: "nên nhập gì" },
    { type: "action", title: "🔍 Tra cứu đơn hàng", command: "tra cứu đơn" },
    { type: "action", title: "📖 Hướng dẫn thêm SP", command: "cách thêm sản phẩm" }
];

// Nhận diện câu hỏi là "tìm/mua sản phẩm" — dùng để trả lời "không tìm thấy" thay vì menu admin
const isProductIntent = (norm) =>
    /\btim\b/.test(norm) || /\bmua\b/.test(norm) || /\bsan pham\b/.test(norm) ||
    /\bgia\b/.test(norm) || /\bgiay\b/.test(norm) || /\bao\b/.test(norm) ||
    /\bquan\b/.test(norm) || /\bmu\b/.test(norm) || /\bvali\b/.test(norm) ||
    /\bbalo\b/.test(norm) || /\bnike\b/.test(norm) || /\badidas\b/.test(norm) ||
    /\bco\b/.test(norm) && /\bsan pham\b/.test(norm);

export const chatService = {
    async handle({ message, user }) {
        const norm = normalizeVietnamese(message);
        const raw = String(message || "").trim();
        const isAdmin = user?.role?.slug === "admin";

        // 0. Small-talk đơn thuần: chỉ trả lời khi câu gần như chỉ là lời chào/cảm ơn/tạm biệt/trợ giúp
        // (tránh nuốt mất câu vừa chào vừa hỏi như "chào, cho mình xem giày")
        if (isPureSmallTalk(norm, GREETING_KEYWORDS.concat(THANKS_KEYWORDS, BYE_KEYWORDS, HELP_KEYWORDS))) {
            const reply = handleSmallTalk(norm);
            if (reply) return { reply, items: [] };
        }

        // 1. Ưu tiên tìm kiếm sản phẩm trước nếu có nhập từ khóa tìm kiếm (tránh việc gõ tìm giày mà bị bắt nhầm vào menu admin)
        const products = await searchProducts(raw);
        const NON_PRODUCT_INTENTS = [
            "thong ke", "doanh thu", "huong dan", "cach", "lam sao", "admin",
            "don hang", "don #", "order", "tra cuu don", "ma don",
            "khuyen mai", "giam gia", "ma giam", "coupon", "uu dai",
            "giao hang", "doi tra", "thanh toan", "bao hanh", "ho tro",
            "xin chao", "cam on", "tam biet", "giup", "hello",
        ];
        if (products.length > 0 && !hasAnyKeyword(norm, NON_PRODUCT_INTENTS)) {
            return { reply: "Tôi tìm thấy các sản phẩm phù hợp:", items: products };
        }
        // Nếu rõ ràng là câu tìm/mua sản phẩm nhưng không có kết quả -> trả lời "không tìm thấy",
        // tuyệt đối không rơi xuống menu admin hay câu hỏi lệch chủ đề.
        if (isProductIntent(norm) && !hasAnyKeyword(norm, NON_PRODUCT_INTENTS)) {
            return {
                reply: "Rất tiếc, mình chưa tìm thấy sản phẩm phù hợp với yêu cầu này. Bạn thử tìm từ khóa khác (vd: \"giày\", \"áo khoác\", \"balo\") hoặc xem thêm trong cửa hàng nhé!",
                items: [],
            };
        }

        // 2. Xử lý khuyến mãi & mã giảm giá
        if (hasAnyKeyword(norm, ["khuyen mai", "giam gia", "ma giam", "coupon", "uu dai"])) {
            return listPromotions();
        }

        // 3. Xử lý FAQ khách hàng
        if (hasAnyKeyword(norm, ["giao hang", "doi tra", "thanh toan", "bao hanh", "ho tro"])) {
            const faq = FAQS.find((f) => hasAnyKeyword(norm, f.keywords));
            if (faq) return { reply: faq.reply, items: [] };
        }

        // 4. Xử lý tra cứu đơn hàng
        if (hasAnyKeyword(norm, ["don hang", "don #", "order", "tra cuu don", "ma don"])) {
            return lookupOrder(user, raw);
        }

        // 5. Xử lý nghiệp vụ dành riêng cho ADMIN
        if (isAdmin) {
            if (hasAnyKeyword(norm, ["thong ke", "doanh thu", "ban chay"])) {
                return getStats(norm);
            }
            if (hasAnyKeyword(norm, ["nen nhap", "goi y", "ton kho"])) {
                return getBusinessAdvice();
            }
            if (hasAnyKeyword(norm, ["lam sao", "cach", "huong dan"])) {
                const guide = ADMIN_GUIDES.find((g) => hasAnyKeyword(norm, g.keywords));
                if (guide) return { reply: guide.reply, items: [] };
            }
        }

        // 6. Nếu sản phẩm search không có, và không khớp intent nào -> Trả về menu admin (nếu là admin) hoặc fallback khách
        if (isAdmin) {
            return {
                reply: "Chào admin, tôi có thể hỗ trợ bạn các tác vụ sau:",
                items: ADMIN_ACTIONS,
            };
        }

        return {
            reply: "Mình chưa hiểu rõ yêu cầu này. Bạn có thể thử:\n\n• Tìm sản phẩm, vd: \"giày thể thao nam\"\n• Tra đơn hàng, vd: \"tra cứu đơn hàng của tôi\"\n• Hỏi khuyến mãi, vd: \"có mã giảm giá nào không\"\n• Hỏi về giao hàng / đổi trả / thanh toán\n\nHoặc gõ \"giúp\" để xem mình hỗ trợ được gì nhé!",
            items: [],
        };
    },
};