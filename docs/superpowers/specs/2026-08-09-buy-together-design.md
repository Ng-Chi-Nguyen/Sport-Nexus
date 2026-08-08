# Thiết kế tính năng #3: "Mua kèm" (Upsell / Cross-sell)

- **Ngày:** 2026-08-09
- **Trạng thái:** Đã duyệt
- **Tính năng:** Khi xem chi tiết sản phẩm, đề xuất các sản phẩm liên quan để tăng giá trị đơn hàng.

## 1. Mục tiêu

Trên trang chi tiết sản phẩm (`/san-pham/:slug`), hiển thị một khối "Gợi ý mua kèm" gồm nhiều nhóm đề xuất nhằm khuyến khích người mua thêm sản phẩm khác vào đơn. Không bắt buộc đăng nhập, không cần schema mới.

## 2. Phạm vi

**Trong phạm vi:**
- Hiển thị khối "Gợi ý mua kèm" ở cuối trang chi tiết sản phẩm (sau `ProductTabs` + `ReviewList`).
- 3 nhóm đề xuất: sản phẩm tương tự, sản phẩm đã like, sản phẩm đã xem gần đây.
- Mỗi sản phẩm hiển thị dưới dạng `ProductCard` (click vào xem chi tiết). Không có cơ chế thêm hàng loạt vào giỏ.
- Ghi lịch sử xem sản phẩm vào localStorage.

**Ngoài phạm vi:**
- Không thêm sản phẩm mua kèm vào giỏ từ chính khối đề xuất.
- Không admin cấu hình thủ công quan hệ sản phẩm.
- Không lưu like/lịch sử xem trên server (không cần đăng nhập).

## 3. Kiến trúc

- **Backend:** thêm 1 endpoint public để lấy sản phẩm tương tự; tái sử dụng endpoint `/by-ids` có sẵn cho like & lịch sử xem.
- **Frontend:** component `RelatedProducts` quản lý 3 nhóm độc lập, tái sử dụng `ProductCard`; tạo `lib/viewHistory` cho lịch sử xem.
- Không có thay đổi schema Prisma, không có migration, không có permission mới.

## 4. Backend

### 4.1 Service — `server/src/services/web/product.service.js`

Thêm method `getRelatedProducts`:

```
getRelatedProducts(productId, { limit = 8 })
```

Logic:
1. Lấy sản phẩm hiện tại (theo `productId`, `deleted_at = ACTIVE`) để có `category_id`, `brand_id`.
2. Truy vấn sản phẩm có `category_id` giống, `is_active = true`, `deleted_at = ACTIVE`, có tồn kho (`ProductVariants.some(stock > 0)`), loại bỏ `id` của sản phẩm hiện tại.
3. Ưu tiên sản phẩm cùng `brand_id` lên trước (sắp xếp).
4. Giới hạn `limit` (mặc định 8).
5. Map qua `mapProduct` (đã có trong file) + `sold_count` từ `getSoldCountsByProductIds`.

Trả về: `{ products: [...] }` (mỗi phần tử theo shape `mapProduct`).

### 4.2 Controller — `server/src/controllers/web/product.controller.js`

Thêm `getRelatedProducts`:
- Đọc `req.params.productId` → `safeInt`.
- Nếu không hợp lệ → trả `{ success: false, message }` (400).
- Gọi service, trả `{ success: true, data: { products } }`.
- Lỗi → 500 `{ success: false }`.

### 4.3 Route — `server/src/routes/web/product.route.js`

Thêm: `.get("/related/:productId", productController.getRelatedProducts)`

Mount vẫn qua `/api/v1/home/product/`. Endpoint đầy đủ:
`GET /api/v1/home/product/related/:productId`

Là route public, không cần `verifyToken`/`checkPermission`.

### 4.4 Tái sử dụng endpoint có sẵn

`GET /api/v1/home/product/by-ids?ids=1,2,3` đã tồn tại (`getProductsByIds`), trả `{ success, data: { products } }`. Dùng cho cả nhóm "đã like" và "đã xem gần đây".

## 5. Frontend

### 5.1 Component mới — `client/src/pages/ProductDetail/components/RelatedProducts.jsx`

- Props: `productId` (id sản phẩm chính), `categoryName` (tiêu đề nhóm "sản phẩm tương tự").
- Hiển thị khối "Gợi ý mua kèm" sau `ReviewList` trong `ProductDetail`.
- Quản lý 3 nhóm, mỗi nhóm có state riêng (`products`, `loading`).
- Dùng `ProductCard` cho từng sản phẩm (grid 2/3/4/6 cột tương tự trang collection detail).
- Loại bỏ sản phẩm chính khỏi mọi nhóm.
- Nếu cả 3 nhóm rỗng → ẩn toàn bộ khối.

**Nhóm 1 — Sản phẩm tương tự:**
- `useEffect` khi `productId` đổi → gọi `GET /home/product/related/:productId`.

**Nhóm 2 — Sản phẩm đã like:**
- Lấy `ids` từ `useWishlist()`.
- Nếu `ids.length > 0` → gọi `GET /home/product/by-ids?ids=...`.
- Đồng bộ khi `ids` thay đổi.

**Nhóm 3 — Sản phẩm đã xem gần đây:**
- Đọc ID từ `lib/viewHistory.getRecentViewIds()`.
- Gọi `GET /home/product/by-ids?ids=...`.

### 5.2 Tạo lib mới — `client/src/lib/viewHistory.js`

Pattern giống `lib/searchHistory.js`:
- Storage key: `sportnexus_recent_views`.
- `getRecentViewIds()` → mảng ID, mới nhất ở đầu, giới hạn ~12.
- `addToViewHistory(productId)` → thêm vào đầu, loại bỏ trùng, giới hạn ~12.

### 5.3 Ghi lịch sử xem — `client/src/pages/ProductDetail/index.jsx`

- Trong `useEffect` (khi có sản phẩm) gọi `addToViewHistory(product.id)`.
- Không chặn render; chỉ chạy khi `product` tồn tại.

### 5.4 Gắn component — `client/src/pages/ProductDetail/index.jsx`

- Render `<RelatedProducts productId={product.id} categoryName={product.category?.name} />` sau `ProductTabs`/`ReviewList`.

### 5.5 i18n — `client/src/locales/{vi,en}`

Thêm key:
- `related_title`: "Gợi ý mua kèm" / "Buy together"
- `related_similar`: "Sản phẩm tương tự" / "Similar products"
- `related_liked`: "Sản phẩm đã thích" / "Liked products"
- `related_viewed`: "Sản phẩm đã xem gần đây" / "Recently viewed"

## 6. Data flow

1. `productDetailLoader` lấy sản phẩm chính.
2. `RelatedProducts` mount → khởi chạy song song 3 luồng dữ liệu.
3. Mỗi nhóm tự render khi có dữ liệu.
4. Ghi `addToViewHistory` sau khi có sản phẩm.

## 7. Error handling & Loading

- Mỗi request bọc try/catch; lỗi → nhóm đó ẩn, không làm hỏng trang.
- `ids` rỗng → không gọi API, nhóm ẩn.
- Cả 3 nhóm rỗng → ẩn toàn bộ khối.
- Loading: mỗi nhóm hiển thị skeleton/spinner khi đang tải (tái dùng `LoadingSpinner` hoặc skeleton của `ProductCard` nếu có).

## 8. Testing

- Backend: `node --check` các file thay đổi; kiểm tra endpoint `/related/:id` bằng HTTP request (backend chưa có test suite).
- Frontend: `npm run build --prefix client` + `npm run lint --prefix client`.
- Kiểm tra UI: mở trang chi tiết, xác nhận 3 nhóm hiển thị đúng khi có dữ liệu và ẩn khi rỗng.

## 9. File thay đổi dự kiến

**Backend:**
- `server/src/services/web/product.service.js` — thêm `getRelatedProducts`
- `server/src/controllers/web/product.controller.js` — thêm `getRelatedProducts`
- `server/src/routes/web/product.route.js` — thêm route `/related/:productId`

**Frontend:**
- `client/src/lib/viewHistory.js` — tạo mới
- `client/src/pages/ProductDetail/components/RelatedProducts.jsx` — tạo mới
- `client/src/pages/ProductDetail/index.jsx` — gắn component + ghi lịch sử xem
- `client/src/locales/vi/*.json`, `client/src/locales/en/*.json` — thêm key i18n

## 10. Ghi chú

- Không có thay đổi schema, không migration, không permission mới.
- Endpoint `/related/:productId` là public như các `/home/*` khác.
