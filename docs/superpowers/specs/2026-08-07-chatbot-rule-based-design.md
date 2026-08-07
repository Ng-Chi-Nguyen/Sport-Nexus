# Thiết kế: Chatbot nội bộ rule-based (khách + admin)

Ngày: 2026-08-07

## Mục tiêu

Thêm chatbot hỗ trợ trực tiếp trên web, chạy bằng logic rule-based (không gọi API AI bên ngoài,
không tốn phí, không cần API key). Bot phục vụ **cả khách hàng lẫn admin** với một widget nổi
dùng chung, tự nhận diện vai trò người dùng.

## Phạm vi

- Backend: endpoint mới `POST /api/v1/chat` + service phân tích ý định.
- Frontend: widget chat nổi góc phải màn hình, dùng chung cho khách và admin.
- Không đổi schema Prisma — bot chỉ đọc dữ liệu đã có (products, orders, coupons, stock, users).

## Kiến trúc

### Backend (`server/`)

**Endpoint mới**: `POST /api/v1/chat`

- Body: `{ message }` (text). Vai trò (khách/admin) tự suy ra từ `req.user` nếu có token,
  không cần client gửi `role`.
- Route: `server/src/routes/core/chat.route.js` → đăng ký trong `index.route.js`.
- Dùng `verifyTokenOptional`: có token = admin (nếu role admin) hoặc khách đã đăng nhập;
  không token = khách vãng lai.

**Service mới**: `server/src/services/chat/chat.service.js`

- Nhận `{ message, user }`, chuẩn hóa (bỏ dấu tiếng Việt, lowercase) rồi định tuyến ý định bằng
  keyword matching.
- Intent router tách riêng từng handler, mỗi handler trả về cấu trúc trả lời nhất quán
  (text + optional items).

**Các intent khách hàng**:

1. `PRODUCT_SEARCH` — từ khóa sản phẩm / danh mục / khoảng giá → query `products` (is_active,
   deleted_at) + `ProductVariants` giá, trả tối đa 5 sản phẩm (tên, giá thấp nhất, thumbnail, slug).
2. `ORDER_LOOKUP` — nhận mã đơn (số) hoặc email → query `orders` theo `id` hoặc `user_email`,
   trả `id`, `status`, `final_amount`, `created_at`. Chỉ hiện chi tiết nếu người dùng đăng nhập
   và là chủ đơn (hoặc admin).
3. `FAQ` — keyword như giao hàng, đổi trả, thanh toán, bảo hành → trả câu trả lời cố định
   (định nghĩa trong file `faq.js`).
4. `PROMOTIONS` — keyword khuyến mãi/giảm giá/mã → query `coupons` `is_active: true`,
   `start_date <= now <= end_date`, trả tối đa 5 mã (code, giảm, điều kiện).

**Các intent admin** (yêu cầu `req.user` có role admin):

1. `STATS` — "doanh thu hôm nay / tuần này / tháng này", "số đơn", "sản phẩm bán chạy"
   → query `orders` + `orderItems` theo khoảng thời gian.
2. `QUICK_LOOKUP` — tra nhanh đơn hàng / user / sản phẩm theo mã hoặc từ khóa.
3. `USAGE_GUIDE` — "làm sao để..." → trả hướng dẫn cố định theo từ khóa chức năng
   (sản phẩm, đơn hàng, coupon, nhập hàng, phân quyền...).
4. `BUSINESS_ADVICE` — "nên nhập gì", "gợi ý kinh doanh" → query tồn kho thấp
   (`productvariants.stock` thấp) + sản phẩm bán chạy (top orderItems) → gợi ý nhập hàng
   và ghi chú kinh doanh.

**Cấu trúc response** thống nhất:

```json
{
  "success": true,
  "data": {
    "reply": "string",
    "items": [ ... ] // tùy chọn: product / order / coupon card
  }
}
```

- Không khớp intent nào → trả reply mặc định + gợi ý các chủ đề có thể hỏi.
- Nếu là intent admin mà không có quyền → trả lời từ chối.

### Frontend (`client/`)

**Component mới**: `client/src/components/chat/ChatWidget.jsx`

- Nút tròn nổi (lucide `MessageCircle`) cố định góc phải dưới, z-index cao.
- Click mở popup chat: khung tin nhắn + input + nút gửi.
- Đọc vai trò từ `localStorage.user` (`role.slug`) — chỉ để hiển thị khác biệt nhỏ
  (VD: bot chào "Chào admin" vs "Chào bạn").
- Gửi `POST /chat` qua `axiosClient` (tự gắn token).
- Hiển thị reply text + items dạng card (sản phẩm: ảnh/tên/giá/link; đơn: mã/trạng thái).
- UI dark-mode theo pattern các component khác (slate/`#0D121F`).

**API client mới**: `client/src/api/chatApi.js` — `send(message)`.

**i18n**: thêm key `chat.*` vào `vi/component.json` và `en/component.json`
(gần nhãn `personal_ai` đã tồn tại).

## Trạng thái UI

- Đang gửi: disabled input + dấu "..." trong khung chat.
- Lỗi: hiện thông báo ngắn trong khung chat.
- Chưa đăng nhập mà hỏi admin intent → bot trả lời từ chối (không sập UI).

## Kiểm chứng

- `npm run build --prefix client`
- `npm run lint --prefix client`
- Backend: kiểm tra khởi động/syntax (`node --check` hoặc khởi động dev ngắn).
- Thủ công: gọi `/chat` với từng intent (khách/admin).

## Ghi chú kỹ thuật

- Không thêm dependency mới.
- Chuẩn hóa tiếng Việt bỏ dấu bằng map thủ công nhỏ trong service (không cần thư viện).
- Bot chỉ đọc, không ghi dữ liệu → an toàn, không đụng luồng kinh doanh hiện tại.
