# Design: i18n EN-VI cho các trang ngoài admin

Ngày: 2026-08-04

## Mục tiêu

Áp dụng hệ thống i18n (EN/VI) cho toàn bộ trang "ngoài admin" trong `client/`, thay các chuỗi tiếng Việt cứng bằng `t("...")`. Tận dụng cơ chế `react-i18next` + file JSON đã có sẵn, không thêm thư viện mới.

## Phạm vi

Các trang/miền cần dịch:
- `checkout` — Checkout, PaymentSuccess
- `cart`
- `profile` — hồ sơ, địa chỉ, đơn hàng, hóa đơn, đổi mật khẩu, chỉnh sửa hồ sơ
- `settings` — favorites, coupons, searchHistory, invoices, support, placeholder
- `product` — ProductDetail + components
- `products` — trang danh mục + FilterSidebar
- `search`
- `tracking`
- `info`
- `auth` — login, register, forgot, reset
- `notfound`

Không nằm trong đợt này: các trang Admin (`/management`), đã dịch một phần qua `dashboard.json`/`component.json`/`constants.json`.

## Kiến trúc

- Mỗi file JSON đứng đầu một module (key namespace). Trang dùng:
  `useTranslation("translation", { keyPrefix: "<module>" })`.
- Chuỗi dùng chung (nút, thao tác...) dùng nhánh `common` đã tồn tại trong `component.json`.

## Files mới

Tạo cho mỗi ngôn ngữ `vi/`, `en/`:
`checkout.json`, `cart.json`, `profile.json`, `settings.json`, `product.json`, `products.json`, `search.json`, `tracking.json`, `info.json`, `auth.json`, `notfound.json`.

Sửa `client/src/lib/i18n.js` để import + `...spread` các file mới vào resources.

## Quy ước

- Chỉ dịch chuỗi hiển thị trực tiếp trong JSX và toast do front tạo.
- Giữ nguyên message trả về từ backend (`res.message`, `error.response.data.message`...) — không dịch data đến từ API.
- Không đổi file-name casing, không đổi logic.

## Thứ tự thực hiện (mỗi miền build + lint riêng)

1. `checkout`
2. `cart`
3. `profile`
4. `settings`
5. `product` + `products`
6. `search`, `tracking`, `info`, `auth`, `notfound`

## Kiểm thử

- `npm run build --prefix client`
- `npm run lint --prefix client`