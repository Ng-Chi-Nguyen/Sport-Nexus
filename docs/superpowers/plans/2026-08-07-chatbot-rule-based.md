# Chatbot Rule-based (Khách + Admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm chatbot rule-based chạy nội bộ (không gọi API AI ngoài) với widget nổi dùng chung, phục vụ cả khách hàng lẫn admin.

**Architecture:** Backend có endpoint mới `POST /api/v1/chat` dùng `verifyTokenOptional` để suy vai trò từ `req.user`; service `chat.service.js` chuẩn hóa tiếng Việt bỏ dấu rồi định tuyến intent bằng keyword matching, mỗi handler query Prisma và trả `{ reply, items }`. Frontend có widget chat nổi góc phải, gửi message qua `axiosClient`, hiển thị reply text + card items.

**Tech Stack:** Node 22 (ESM), Express 5, Prisma 5, React 19, Vite, lucide-react, i18next.

**Spec:** `docs/superpowers/specs/2026-08-07-chatbot-rule-based-design.md`

---

## File Structure

**Backend (server/):**
- Create `server/src/utils/vietnamese.utils.js` — hàm bỏ dấu tiếng Việt + chuẩn hóa.
- Create `server/src/services/chat/faq.js` — dữ liệu FAQ cố định + hướng dẫn admin.
- Create `server/src/services/chat/chat.service.js` — intent router + handlers (khách + admin).
- Create `server/src/controllers/chat/chat.controller.js` — controller mỏng.
- Create `server/src/routes/core/chat.route.js` — route `/chat`.
- Modify `server/src/routes/index.route.js` — đăng ký route.

**Frontend (client/):**
- Create `client/src/api/chatApi.js` — gọi POST `/chat`.
- Create `client/src/components/chat/ChatWidget.jsx` — widget nổi.
- Modify `client/src/App.jsx` — mount `ChatWidget`.
- Modify `client/src/locales/vi/component.json` và `client/src/locales/en/component.json` — key `chat.*`.

**Lưu ý:** Backend repo **không có test suite** (`npm test --prefix server` là placeholder). Thay thế TDD bằng: mỗi task viết **script kiểm tra tạm** (`prisma/_tmp_*.mjs` chạy service trực tiếp) rồi xóa. Các task này dùng `node --check` để kiểm tra syntax.

---

### Task 1: Util bỏ dấu tiếng Việt

**Files:**
- Create: `server/src/utils/vietnamese.utils.js`

- [ ] **Step 1: Viết file**

```js
const VIETNAMESE_MAP = {
  'a': 'áàảãạăắằẳẵặâấầẩẫậ',
  'd': 'đ',
  'e': 'éèẻẽẹêếềểễệ',
  'i': 'íìỉĩị',
  'o': 'óòỏõọôốồổỗộơớờởỡợ',
  'u': 'úùủũụưứừửữự',
  'y': 'ýỳỷỹỵ',
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

export const normalizeVietnamese = (text = '') =>
  String(text)
    .toLowerCase()
    .split('')
    .map((ch) => REVERSE[ch] || ch)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/utils/vietnamese.utils.js` (từ `server/`)
Expected: không in gì (pass).

- [ ] **Step 3: Commit**

```bash
git add server/src/utils/vietnamese.utils.js
git commit -m "feat(chat): add vietnamese normalization util"
```

---

### Task 2: Dữ liệu FAQ + hướng dẫn admin

**Files:**
- Create: `server/src/services/chat/faq.js`

- [ ] **Step 1: Viết file**

```js
// FAQ trả lời cố định cho khách hàng. Key đã được bỏ dấu, so khớp chứa keyword.
export const FAQS = [
  {
    keywords: ['giao hang', 'van chuyen', 'nhan hang', 'bao lau', 'mat bao lau', 'van don'],
    reply:
      'Chúng tôi giao hàng toàn quốc qua đơn vị vận chuyển (mô phỏng GHN). ' +
      'Đơn thường được giao trong 2-5 ngày làm việc tùy khu vực. Bạn có thể theo dõi ' +
      'vận đơn trong chi tiết đơn hàng của mình.',
  },
  {
    keywords: ['doi tra', 'hoan tien', 'hoan hang', 'tra hang', 'refund'],
    reply:
      'Bạn có thể yêu cầu đổi trả trong 7 ngày kể từ khi nhận hàng nếu sản phẩm lỗi ' +
      'hoặc không đúng mô tả. Khi đơn bị hủy hoặc hoàn trả, tiền sẽ được hoàn về ' +
      'phương thức thanh toán ban đầu.',
  },
  {
    keywords: ['thanh toan', 'chuyen khoan', 'cod', 'momo', 'vnpay', 'the tin dung', 'credit'],
    reply:
      'Chúng tôi hỗ trợ các hình thức: Thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, ' +
      'ví MoMo, cổng VNPay và thẻ tín dụng.',
  },
  {
    keywords: ['bao hanh', 'bao mat', 'hang that', 'chinh hang', 'ho tro', 'lien he'],
    reply:
      'Tất cả sản phẩm đều chính hãng, có bảo hành theo quy định của từng hãng. ' +
      'Nếu cần hỗ trợ, bạn có thể gửi email hoặc liên hệ qua fanpage của shop.',
  },
];

// Hướng dẫn dùng chức năng cho admin. Key đã bỏ dấu.
export const ADMIN_GUIDES = [
  {
    keywords: ['them san pham', 'tao san pham', 'san pham moi'],
    reply:
      'Để thêm sản phẩm: vào Quản lý > Sản phẩm > nút "Thêm sản phẩm", điền tên, ' +
      'giá, danh mục, thương hiệu, nhà cung cấp rồi lưu. Sau đó tạo biến thể (màu/size) ' +
      'trong mục "Sản phẩm chi tiết".',
  },
  {
    keywords: ['tao coupon', 'them ma giam', 'khuyen mai', 'ma giam gia'],
    reply:
      'Để tạo khuyến mãi: vào Quản lý > Khuyến mãi > "Thêm mã giảm giá", chọn loại giảm ' +
      '(tiền mặt hoặc phần trăm), điền giá trị tối đa, điều kiện đơn tối thiểu và thời hạn.',
  },
  {
    keywords: ['nhap hang', 'phieu nhap', 'nha cung cap', 'purchase', 'ton kho'],
    reply:
      'Để nhập hàng: vào Quản lý > Nhập hàng > "Thêm phiếu nhập", chọn nhà cung cấp, ' +
      'thêm các biến thể + số lượng + đơn giá nhập rồi lưu. Khi nhận đủ hàng, cập nhật ' +
      'trạng thái phiếu thành RECEIVED để tồn kho tăng.',
  },
  {
    keywords: ['phan quyen', 'them nguoi dung', 'tao user', 'role', 'vai tro'],
    reply:
      'Để phân quyền: vào Quản lý > Phân quyền để quản lý quyền, hoặc vào Quản lý > ' +
      'Khách hàng > chọn user > "Thêm vai trò & quyền" để gán vai trò.',
  },
];
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/services/chat/faq.js`
Expected: pass (không in gì).

- [ ] **Step 3: Commit**

```bash
git add server/src/services/chat/faq.js
git commit -m "feat(chat): add faq and admin guide data"
```

---

### Task 3: Chat service — khách hàng

**Files:**
- Create: `server/src/services/chat/chat.service.js`
- Test tạm: `server/prisma/_tmp_chat_customer.mjs`

- [ ] **Step 1: Viết service (phần khách)**

```js
import prisma from '../../db/prisma.js';
import { ACTIVE } from '../../utils/prisma.js';
import { normalizeVietnamese } from '../../utils/vietnamese.utils.js';
import { FAQS, ADMIN_GUIDES } from './faq.js';

const ORDER_STATUS_LABELS = {
  Processing: 'Chuẩn bị hàng',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
  Refunded: 'Hoàn tiền',
};

const formatMoney = (n) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(n || 0));

const hasAnyKeyword = (norm, keywords) =>
  keywords.some((k) => norm.includes(k));

const searchProducts = async (query) => {
  const norm = normalizeVietnamese(query);
  const num = Number(norm.replace(/[^\d]/g, ''));
  const where = { is_active: true, deleted_at: ACTIVE };

  if (!Number.isNaN(num) && num > 0) {
    const moneyKeywords = ['gia', 'duoi', 'tren', 'khoang', 'tu', 'den'];
    if (moneyKeywords.some((k) => norm.includes(k))) {
      // "<num>" => giá <= num, ">num" => giá >= num (mặc định dùng <=)
      where.ProductVariants = { some: { deleted_at: ACTIVE, price: { lte: num } } };
    }
  }
  if (norm && !norm.includes('gia')) where.name = { contains: query.trim() };

  const products = await prisma.Products.findMany({
    where,
    select: {
      id: true, name: true, slug: true, thumbnail: true,
      ProductVariants: { select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
    },
    take: 5,
  });

  return products.map((p) => ({
    type: 'product',
    title: p.name,
    subtitle: `Giá từ ${formatMoney(p.ProductVariants[0]?.price)}đ`,
    image: p.thumbnail,
    link: `/san-pham/${p.slug}`,
  }));
};

const lookupOrder = async (user, raw) => {
  const norm = normalizeVietnamese(raw);
  const orderId = Number(raw.trim().replace(/\D/g, ''));
  const isEmail = raw.includes('@');
  const where = isEmail ? { user_email: raw.trim() } : { id: orderId };

  if (isEmail) {
    const order = await prisma.Orders.findFirst({
      where: { ...where, user_email: user?.email || '' },
      orderBy: { created_at: 'desc' },
      take: 1,
    });
    if (!order) return { reply: 'Không tìm thấy đơn hàng cho email này.', items: [] };
    return {
      reply: `Đơn gần nhất của bạn: #${order.id} — ${ORDER_STATUS_LABELS[order.status] || order.status}, tổng ${formatMoney(order.final_amount)}đ.`,
      items: [],
    };
  }

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return { reply: 'Vui lòng gửi mã đơn hàng (số) hoặc email của bạn.', items: [] };
  }
  const order = await prisma.Orders.findUnique({ where: { id: orderId } });
  if (!order) return { reply: `Không tìm thấy đơn hàng #${orderId}.`, items: [] };
  if (user && user.role?.slug !== 'admin' && order.usersId !== user.id) {
    return { reply: 'Bạn chỉ có thể xem đơn hàng của chính mình.', items: [] };
  }
  return {
    reply: `Đơn #${order.id}: trạng thái ${ORDER_STATUS_LABELS[order.status] || order.status}, thanh toán ${order.payment_status}, tổng ${formatMoney(order.final_amount)}đ.`,
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
  if (coupons.length === 0) return { reply: 'Hiện chưa có khuyến mãi nào đang diễn ra.', items: [] };
  return {
    reply: 'Các mã giảm giá đang hiệu lực:',
    items: coupons.map((c) => ({
      type: 'coupon',
      title: c.code,
      subtitle:
        c.discount_type === 'PERCENTAGE'
          ? `Giảm ${c.discount_value}% (đơn từ ${formatMoney(c.min_order_value)}đ)`
          : `Giảm ${formatMoney(c.discount_value)}đ (đơn từ ${formatMoney(c.min_order_value)}đ)`,
    })),
  };
};
```

- [ ] **Step 2: Viết phần admin + intent router (thêm vào cuối cùng file)**

```js
const isAdminUser = (user) => user?.role?.slug === 'admin';

const getStats = async (norm) => {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);
  let from;
  let label;
  if (norm.includes('thang')) { from = new Date(`${month}-01T00:00:00.000Z`); label = `tháng ${month}`; }
  else if (norm.includes('tuan') || norm.includes('7 ngay')) { from = new Date(Date.now() - 7 * 86400000); label = '7 ngày qua'; }
  else { from = new Date(`${day}T00:00:00.000Z`); label = 'hôm nay'; }

  const orders = await prisma.Orders.findMany({
    where: { created_at: { gte: from } },
    select: { final_amount: true, status: true, id: true },
  });
  const revenue = orders.reduce((s, o) => s + Number(o.final_amount || 0), 0);
  const delivered = orders.filter((o) => o.status === 'Delivered').length;

  const topItems = await prisma.OrderItems.groupBy({
    by: ['product_variant_id'],
    where: { order: { created_at: { gte: from } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 3,
  });
  const variantIds = topItems.map((t) => t.product_variant_id);
  const variants = variantIds.length
    ? await prisma.ProductVariants.findMany({ where: { id: { in: variantIds } }, select: { id: true, product: { select: { name: true } } } })
    : [];

  return {
    reply:
      `Thống kê ${label}: tổng ${orders.length} đơn, doanh thu ${formatMoney(revenue)}đ, ` +
      `${delivered} đơn đã giao. ` +
      (variants.length
        ? `Sản phẩm bán chạy: ${variants.map((v) => v.product.name).join(', ')}.`
        : 'Chưa có dữ liệu bán chạy.'),
    items: [],
  };
};

const getBusinessAdvice = async () => {
  const [lowStock, top] = await Promise.all([
    prisma.ProductVariants.findMany({
      where: { deleted_at: ACTIVE, stock: { lte: 10 } },
      select: { id: true, stock: true, product: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 5,
    }),
    prisma.OrderItems.groupBy({
      by: ['product_variant_id'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 3,
    }),
  ]);
  const topIds = top.map((t) => t.product_variant_id);
  const topVariants = topIds.length
    ? await prisma.ProductVariants.findMany({ where: { id: { in: topIds } }, select: { id: true, product: { select: { name: true } } } })
    : [];

  return {
    reply:
      (lowStock.length
        ? `Nên nhập thêm (tồn kho thấp): ${lowStock.map((v) => `${v.product.name} (còn ${v.stock})`).join(', ')}. `
        : 'Tồn kho đang ổn. ') +
      (topVariants.length
        ? `Sản phẩm bán chạy nên ưu tiên tồn: ${topVariants.map((v) => v.product.name).join(', ')}.`
        : 'Chưa đủ dữ liệu để gợi ý.'),
    items: [],
  };
};

const quickLookup = async (raw) => {
  const orderId = Number(raw.trim().replace(/\D/g, ''));
  const isEmail = raw.includes('@');
  if (isEmail) {
    const users = await prisma.Users.findMany({
      where: { email: raw.trim() },
      select: { id: true, full_name: true, email: true, phone_number: true },
      take: 3,
    });
    if (!users.length) return { reply: 'Không tìm thấy người dùng.', items: [] };
    return { reply: `Tìm thấy ${users.length} người dùng:`, items: users.map((u) => ({ type: 'user', title: u.full_name, subtitle: `${u.email} — ${u.phone_number || ''}` })) };
  }
  if (Number.isFinite(orderId) && orderId > 0) {
    const order = await prisma.Orders.findUnique({ where: { id: orderId } });
    if (!order) return { reply: `Không tìm thấy đơn #${orderId}.`, items: [] };
    return { reply: `Đơn #${order.id}: ${ORDER_STATUS_LABELS[order.status] || order.status}, ${formatMoney(order.final_amount)}đ.`, items: [] };
  }
  const products = await searchProducts(raw);
  if (products.length) return { reply: 'Kết quả tìm sản phẩm:', items: products };
  return { reply: 'Không tìm thấy kết quả phù hợp.', items: [] };
};

const FALLBACK_REPLY =
  'Tôi chưa hiểu ý bạn. Bạn có thể hỏi về: sản phẩm (vd "tìm giày chạy bộ"), ' +
  'đơn hàng (vd "đơn #13217"), khuyến mãi, hoặc chính sách giao hàng/đổi trả.';

const ADMIN_FALLBACK_REPLY =
  'Tôi có thể giúp admin: thống kê ("doanh thu hôm nay", "sản phẩm bán chạy"), ' +
  'tra cứu nhanh (mã đơn, email), hướng dẫn ("cách thêm sản phẩm", "cách tạo coupon"), ' +
  'và gợi ý kinh doanh ("nên nhập gì").';

export const chatService = {
  async handle({ message, user }) {
    const norm = normalizeVietnamese(message);
    const raw = String(message || '').trim();

    // ---- INTENT KHÁCH HÀNG (ai cũng hỏi được) ----
    if (hasAnyKeyword(norm, ['khuyen mai', 'giam gia', 'ma giam', 'coupon', 'uu dai'])) {
      return listPromotions();
    }
    if (hasAnyKeyword(norm, ['giao hang', 'doi tra', 'thanh toan', 'bao hanh', 'ho tro'])) {
      const faq = FAQS.find((f) => hasAnyKeyword(norm, f.keywords));
      if (faq) return { reply: faq.reply, items: [] };
    }
    if (hasAnyKeyword(norm, ['don hang', 'don #', 'don so', 'tra cuu don', 'ma don', 'order', 'email cua toi'])) {
      return lookupOrder(user, raw);
    }

    // ---- INTENT ADMIN ----
    const isAdmin = isAdminUser(user);
    if (hasAnyKeyword(norm, ['thong ke', 'doanh thu', 'ban chay', 'so don', 'tong don'])) {
      if (!isAdmin) return { reply: 'Chỉ admin mới xem được thống kê này.', items: [] };
      return getStats(norm);
    }
    if (hasAnyKeyword(norm, ['nen nhap', 'goi y kinh doanh', 'goi y nhap', 'ton kho thap', 'san pham nao nen nhap'])) {
      if (!isAdmin) return { reply: 'Chỉ admin mới xem được gợi ý này.', items: [] };
      return getBusinessAdvice();
    }
    if (hasAnyKeyword(norm, ['lam sao', 'cach', 'huong dan', 'lam the nao', 'help admin'])) {
      if (!isAdmin) return { reply: 'Chỉ admin mới dùng hướng dẫn này.', items: [] };
      const guide = ADMIN_GUIDES.find((g) => hasAnyKeyword(norm, g.keywords));
      if (guide) return { reply: guide.reply, items: [] };
    }
    if (isAdmin && hasAnyKeyword(norm, ['tra cuu', 'tim user', 'tim don', 'tim san pham', 'lookup', 'check don'])) {
      return quickLookup(raw);
    }

    // ---- SẢN PHẨM / FALLBACK ----
    const products = await searchProducts(raw);
    if (products.length) return { reply: 'Tôi tìm thấy các sản phẩm sau:', items: products };
    return { reply: isAdmin ? ADMIN_FALLBACK_REPLY : FALLBACK_REPLY, items: [] };
  },
};
```

- [ ] **Step 3: Kiểm tra syntax**

Run: `node --check src/services/chat/chat.service.js`
Expected: pass.

- [ ] **Step 4: Chạy script kiểm tra khách**

Tạo `server/prisma/_tmp_chat_customer.mjs`:

```js
import { chatService } from '../src/services/chat/chat.service.js';

const cases = [
  'tim giày chạy bộ',
  'don hang #13217',
  'khuyen mai gi vay',
  'giao hang bao lau',
  'xin chao',
];

for (const msg of cases) {
  const r = await chatService.handle({ message: msg, user: null });
  console.log(`\n> ${msg}\n${r.reply}`);
  for (const it of r.items) console.log(`  - ${it.title} | ${it.subtitle}`);
}
await prisma?.$disconnect?.();
```

Sửa dòng cuối để import prisma từ `../src/db/prisma.js` và gọi `$disconnect` đúng cách:

```js
import prisma from '../src/db/prisma.js';
import { chatService } from '../src/services/chat/chat.service.js';
```

Run: `node prisma/_tmp_chat_customer.mjs`
Expected: `> tim giày chạy bộ` trả về 1-2 items sản phẩm; `don hang #13217` trả trạng thái; `khuyen mai` trả list coupon (hoặc "chưa có"); `giao hang bao lau` trả FAQ; `xin chao` trả fallback.

- [ ] **Step 5: Xóa script tạm + commit**

```bash
Remove-Item prisma/_tmp_chat_customer.mjs
git add server/src/services/chat/chat.service.js
git commit -m "feat(chat): add chat service with customer and admin intents"
```

---

### Task 4: Controller + route + đăng ký

**Files:**
- Create: `server/src/controllers/chat/chat.controller.js`
- Create: `server/src/routes/core/chat.route.js`
- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Viết controller**

```js
import { chatService } from '../../services/chat/chat.service.js';

export const chatController = {
  async handle(req, res) {
    const { message } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn.' });
    }
    try {
      const data = await chatService.handle({ message, user: req.user || null });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi xử lý tin nhắn.',
        error: error.message,
      });
    }
  },
};
```

- [ ] **Step 2: Viết route**

```js
import express from 'express';
import { verifyTokenOptional } from '../../middlewares/verifyToken.middlware.js';
import { chatController } from '../../controllers/chat/chat.controller.js';

const chatRoute = express.Router();

chatRoute.post('/', verifyTokenOptional, chatController.handle);

export default chatRoute;
```

- [ ] **Step 3: Đăng ký trong `index.route.js`**

Thêm import (sau dòng import `managementShippingRoute`, ~dòng 34):

```js
import chatRoute from "./core/chat.route.js";
```

Thêm đăng ký (sau block Core, trước block Auth, ~dòng 73):

```js
    app.use(`${api_prefix_v1}chat/`, chatRoute)
```

- [ ] **Step 4: Kiểm tra syntax**

Run: `node --check src/controllers/chat/chat.controller.js` rồi `node --check src/routes/core/chat.route.js`
Expected: cả 2 pass.

- [ ] **Step 5: Commit**

```bash
git add server/src/controllers/chat/chat.controller.js server/src/routes/core/chat.route.js server/src/routes/index.route.js
git commit -m "feat(chat): add chat route and controller"
```

---

### Task 5: API client frontend

**Files:**
- Create: `client/src/api/chatApi.js`

- [ ] **Step 1: Viết file**

```jsx
import axiosClient from "@/lib/axiosClient";

const chatApi = {
  send: (message) => {
    const url = "/chat";
    return axiosClient.post(url, { message });
  },
};

export default chatApi;
```

- [ ] **Step 2: Kiểm tra lint/build**

Run: `npm run lint --prefix client`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add client/src/api/chatApi.js
git commit -m "feat(chat): add chat api client"
```

---

### Task 6: Component ChatWidget

**Files:**
- Create: `client/src/components/chat/ChatWidget.jsx`

- [ ] **Step 1: Viết component**

```jsx
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import chatApi from "@/api/chatApi";
import { formatCurrency } from "@/utils/formatters";

const ChatItemCard = ({ item }) => {
  if (item.type === "product") {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D121F]/60 p-2.5 hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="h-10 w-10 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
            {item.title}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {item.subtitle}
          </p>
        </div>
      </a>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D121F]/60 px-3 py-2">
      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
        {item.title}
      </p>
      {item.subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {item.subtitle}
        </p>
      )}
    </div>
  );
};

const ChatWidget = () => {
  const { t } = useTranslation("translation", { keyPrefix: "chat" });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role?.slug === "admin";

  useEffect(() => {
    if (open) {
      setMessages([
        {
          from: "bot",
          text: isAdmin
            ? t("welcome_admin", "Chào admin! Tôi có thể hỗ trợ thống kê, tra cứu nhanh, hướng dẫn và gợi ý kinh doanh.")
            : t("welcome_user", "Xin chào! Tôi là trợ lý Sport Nexus. Hỏi tôi về sản phẩm, đơn hàng, khuyến mãi hoặc chính sách nhé!"),
        },
      ]);
    }
  }, [open, isAdmin, t]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text }]);
    setLoading(true);
    try {
      const res = await chatApi.send(text);
      const data = res?.data;
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: data?.reply || "Không có phản hồi.",
          items: data?.items || [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: t("error", "Đã xảy ra lỗi. Vui lòng thử lại sau.") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("open_chat", "Mở chat")}
        className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30 hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[90] flex h-[480px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D121F] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-[#111827]/60">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t("title", "Trợ lý Sport Nexus")}
            </p>
          </div>
          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] space-y-2 rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.from === "user"
                      ? "bg-sky-500 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  {m.items?.length > 0 && (
                    <div className="space-y-2">
                      {m.items.map((it, j) => (
                        <ChatItemCard key={j} item={it} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5">
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("placeholder", "Nhập tin nhắn...")}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]/60 px-3 py-2 text-sm outline-none focus:border-sky-400 dark:focus:border-sky-500"
            />
            <button
              onClick={send}
              disabled={loading}
              aria-label={t("send", "Gửi")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
```

- [ ] **Step 2: Kiểm tra build**

Run: `npm run build --prefix client`
Expected: build pass.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/chat/ChatWidget.jsx
git commit -m "feat(chat): add floating chat widget"
```

---

### Task 7: i18n keys + mount widget vào App

**Files:**
- Modify: `client/src/locales/vi/component.json`
- Modify: `client/src/locales/en/component.json`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Thêm key vào `vi/component.json`** — thêm khối `"chat": {...}` sau khối `"menu"` (dòng 138, trước `}` đóng file):

```json
  ,
  "chat": {
    "title": "Trợ lý Sport Nexus",
    "open_chat": "Mở chat",
    "placeholder": "Nhập tin nhắn...",
    "send": "Gửi",
    "welcome_user": "Xin chào! Tôi là trợ lý Sport Nexus. Hỏi tôi về sản phẩm, đơn hàng, khuyến mãi hoặc chính sách nhé!",
    "welcome_admin": "Chào admin! Tôi có thể hỗ trợ thống kê, tra cứu nhanh, hướng dẫn và gợi ý kinh doanh.",
    "error": "Đã xảy ra lỗi. Vui lòng thử lại sau."
  }
```

- [ ] **Step 2: Thêm key vào `en/component.json`** tương tự (dịch sang tiếng Anh):

```json
  ,
  "chat": {
    "title": "Sport Nexus Assistant",
    "open_chat": "Open chat",
    "placeholder": "Type a message...",
    "send": "Send",
    "welcome_user": "Hello! I am the Sport Nexus assistant. Ask me about products, orders, promotions or policies!",
    "welcome_admin": "Hi admin! I can help with statistics, quick lookups, guides and business suggestions.",
    "error": "Something went wrong. Please try again later."
  }
```

- [ ] **Step 3: Mount `ChatWidget` vào `App.jsx`** — thêm import ở đầu file (sau dòng 7 `LoadingSpinner`):

```jsx
import ChatWidget from "@/components/chat/ChatWidget";
```

Thêm component ngay trước thẻ đóng `</div>` cuối cùng của `App` (sau `{!isManagementView && <Footer .../>}` khối, dòng ~79):

```jsx
      <ChatWidget />
```

- [ ] **Step 4: Kiểm tra build + lint**

Run: `npm run build --prefix client` rồi `npm run lint --prefix client`
Expected: cả 2 pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/App.jsx client/src/locales/vi/component.json client/src/locales/en/component.json
git commit -m "feat(chat): add chat i18n keys and mount widget"
```

---

### Task 8: Kiểm chứng tổng thể

**Files:** (chỉ chạy lệnh, không sửa file)

- [ ] **Step 1: Kiểm tra syntax backend toàn bộ file mới**

Run: `node --check src/services/chat/faq.js; node --check src/services/chat/chat.service.js; node --check src/controllers/chat/chat.controller.js; node --check src/routes/core/chat.route.js; node --check src/utils/vietnamese.utils.js` (từ `server/`)
Expected: tất cả pass.

- [ ] **Step 2: Build + lint frontend**

Run: `npm run build --prefix client` rồi `npm run lint --prefix client`
Expected: cả 2 pass.

- [ ] **Step 3: Smoke test endpoint (server dev đang chạy)**

Khởi động server: `npm run dev --prefix server`. Sau đó gọi:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/v1/chat -ContentType "application/json" -Body '{"message":"tim giày chạy bộ"}' | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/v1/chat -ContentType "application/json" -Body '{"message":"doanh thu hôm nay"}' | ConvertTo-Json -Depth 5
```

Expected: call 1 trả `success: true` + items sản phẩm; call 2 trả reply "Chỉ admin mới xem được thống kê này." (vì chưa có token) hoặc thống kê nếu có token.

- [ ] **Step 4: Thủ công trên web**

Mở web, nhấn nút chat góc phải dưới, gửi "tìm giày" và "khuyến mãi". Expected: bot trả lời có card sản phẩm/coupon. Đăng nhập admin rồi hỏi "doanh thu hôm nay". Expected: trả thống kê.

- [ ] **Step 5: Commit nếu có sửa phát sinh**

```bash
git add -A
git commit -m "fix(chat): final adjustments after smoke test"
```

---

## Self-Review

**1. Spec coverage:**
- Endpoint `POST /api/v1/chat` + `verifyTokenOptional` → Task 4. ✔
- Intent khách: PRODUCT_SEARCH → Task 3 `searchProducts`; ORDER_LOOKUP → `lookupOrder`; FAQ → FAQS; PROMOTIONS → `listPromotions`. ✔
- Intent admin: STATS → `getStats`; QUICK_LOOKUP → `quickLookup`; USAGE_GUIDE → ADMIN_GUIDES; BUSINESS_ADVICE → `getBusinessAdvice`. ✔
- Widget nổi chung + tự nhận vai trò → Task 6 (đọc `localStorage.user`, `role.slug === "admin"`). ✔
- i18n → Task 7. ✔
- Không đổi schema, không thêm dependency → toàn bộ plan. ✔

**2. Placeholder scan:** Mọi bước đều có code/lệnh cụ thể. Không có TBD/TODO. ✔

**3. Type consistency:** `chatService.handle({ message, user })` dùng nhất quán ở service, controller, script test. `ChatWidget` gọi `chatApi.send(text)` và đọc `res.data`. `normalizeVietnamese`/`hasAnyKeyword` nhất quán. ✔
