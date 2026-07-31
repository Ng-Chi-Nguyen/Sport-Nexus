# Design: Trang lịch sử tìm kiếm

- **Ngày:** 2026-07-31
- **Phạm vi:** Frontend (`client/`) — không thay đổi API backend.

## Mục tiêu

Tạo trang `/lich-su-tim-kiem` có giá trị **khác biệt** với thanh search (SearchBar). Thay vì chỉ liệt kê lại các từ khóa (trùng với dropdown của SearchBar), trang này giúp người dùng **khám phá lại** sản phẩm dựa trên lịch sử tìm kiếm:

1. Danh sách từ khóa đã tìm, **nhóm theo thời gian** (Hôm nay / Hôm qua / Trước đó), có thể tìm lại nhanh và quản lý (xóa từng mục / xóa tất cả).
2. **"Có thể bạn quan tâm"**: sản phẩm gợi ý tổng hợp từ 3 từ khóa gần nhất.

## Dữ liệu — nâng cấp `client/src/lib/searchHistory.js`

Hiện tại lưu mảng string đơn giản (`sportnexus_search_history`, tối đa 10). Nâng cấp để lưu thêm thời điểm tìm:

- Dạng lưu trữ mới: `[{ term: string, ts: number }]`, vẫn giới hạn 10 phần tử, phần tử mới nhất ở đầu.
- `addToSearchHistory(term)`:
  - Trim `term`, bỏ qua nếu rỗng.
  - Xóa mục trùng `term` (cũ) khỏi mảng.
  - Thêm `{ term, ts: Date.now() }` vào đầu.
  - Cắt còn 10 phần tử rồi ghi vào localStorage.
- `removeFromSearchHistory(term)`: lọc bỏ mục có `term` khớp.
- `clearSearchHistory()`: ghi `[]`.
- `getSearchHistory()`: đọc + **migrate dữ liệu cũ** — mục còn là string được chuyển thành `{ term: s, ts: 0 }`; trả về mảng `{ term, ts }`.
- Giữ nguyên các hàm `recordLastSearchTerm`, `getLastSearchTerm`, `clearLastSearchTerm` (sessionStorage, không đổi).

### Tác động tới nơi đang dùng

- `client/src/components/search/SearchBar.jsx`:
  - `const [history, setHistory] = useState(() => getSearchHistory());` — giờ trả mảng object.
  - Trong JSX: `history.map((term) => ...)` phải đổi thành `history.map((item) => item.term)`; nút xóa từng mục dùng `removeFromSearchHistory(item.term)`.
- `client/src/pages/ProductDetail/index.jsx`: kiểm tra cách dùng `getSearchHistory`/`addToSearchHistory`; điều chỉnh cho khớp kiểu mới nếu cần (chỉ đọc term string).

## Trang `/lich-su-tim-kiem`

### Route

- Thêm route lazy trong `client/src/routes/webRoute.jsx`, path `/lich-su-tim-kiem` → `SearchHistoryPage` (`client/src/pages/searchHistory/index.jsx`).
- Đảm bảo có `Suspense`/lazy đúng pattern hiện có của `webRoute.jsx`.

### Cấu trúc trang (`pages/searchHistory/index.jsx`)

- Layout: `min-h-screen`, container `max-w-5xl mx-auto px-4 py-8`, `Breadcrumbs` "Trang chủ / Lịch sử tìm kiếm".
- State cục bộ: `history` (từ `getSearchHistory()`), cập nhật lại sau mỗi thao tác xóa.

**Phần 1 — Lịch sử tìm kiếm**
- Header: tiêu đề "Lịch sử tìm kiếm" + nút "Xóa tất cả" (chỉ hiện khi có lịch sử).
- Nhóm theo `ts`:
  - `Hôm nay`: cùng ngày với `Date.now()`.
  - `Hôm qua`: trước hôm nay 1 ngày.
  - `Trước đó`: còn lại (gồm cả mục migrate `ts: 0`).
- Mỗi mục: icon `Clock`, text từ khóa, nút `X` (xóa riêng). Click vào từ khóa → `navigate('/tim-kiem?q=' + encodeURIComponent(term))`.
- Empty state khi không có lịch sử: icon `Search`, "Chưa có lịch sử tìm kiếm", hướng dẫn nhẹ.

**Phần 2 — Có thể bạn quan tâm**
- Lấy 3 mục mới nhất từ `history` (`history.slice(0, 3).map(i => i.term)`).
- Nếu không có từ khóa → ẩn phần này.
- `useQuery`:
  - `queryKey: ['search-history-suggestions', terms.join(',')]`
  - `queryFn`: `Promise.all(terms.map(t => searchApi.searchProducts({ q: t, limit: 4 })))`, gộp `res.data.products` từ các kết quả `success`, loại trùng theo `id`, giữ tối đa 12 sản phẩm.
  - `enabled: terms.length > 0`.
- Hiển thị: tiêu đề "Có thể bạn quan tâm" + grid `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` bằng `ProductCard` (`@/components/ui/card`).
- Loading: `LoadingSpinner` (`@/components/ui/loadingSpinner`).
- Không có sản phẩm / API lỗi: ẩn phần gợi ý (không gây lỗi trang).

## Xử lý lỗi

- Gọi API gợi ý thất bại → silent, ẩn phần "Có thể bạn quan tâm".
- localStorage không khả dụng → `getSearchHistory` trả `[]`; các hàm ghi đều `try/catch`.

## Xác thực

- `npm run build --prefix client` và `npm run lint --prefix client` không có lỗi mới.
- Dùng agent-browser:
  - Tìm kiếm vài từ khóa qua SearchBar, vào `/lich-su-tim-kiem`, kiểm tra nhóm "Hôm nay".
  - Kiểm tra phần "Có thể bạn quan tâm" hiển thị sản phẩm gộp từ 3 từ khóa.
  - Xóa từng mục, xóa tất cả → empty state hiển thị.
  - Click từ khóa → chuyển tới `/tim-kiem?q=...`.

## Ngoài phạm vi

- Không thêm endpoint backend mới.
- Không đồng bộ lịch sử theo tài khoản (vẫn là localStorage theo trình duyệt).
- Không thêm tab/thống kê (hướng B, C đã loại bỏ).
