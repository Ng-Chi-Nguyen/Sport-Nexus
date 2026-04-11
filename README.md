# SportNexus

SportNexus là dự án web thương mại điện tử cho lĩnh vực thể thao, gồm frontend cho người dùng/admin và backend API quản lý dữ liệu, xác thực, đơn hàng, tồn kho.

## Tổng quan kiến trúc

- `client/`: ứng dụng React 19 + Vite, chịu trách nhiệm UI/UX, routing, gọi API.
- `server/`: Express 5 + Prisma, xử lý auth/permission, domain nghiệp vụ và truy cập database.
- `docs/`: tài liệu tham khảo (onboarding, ghi chú), không phải nguồn chuẩn cho schema.

Luồng tổng quát:
1. Frontend gửi request đến backend qua `VITE_API_URL`.
2. Backend xác thực JWT, xử lý nghiệp vụ (catalog, cart, orders, inventory...).
3. Backend đọc/ghi MySQL qua Prisma và tích hợp dịch vụ ngoài (Supabase Storage, mail).

## Tech stack chính

- Frontend: React 19, Vite, React Router, TanStack Query, Tailwind CSS
- Backend: Express 5, Prisma ORM, MySQL, JWT, Supabase Storage, Nodemailer
- Tooling: npm scripts ở root để chạy đồng thời client/server

## Yêu cầu hệ thống

- Node.js 18+
- npm 9+
- MySQL (hoặc môi trường DB tương thích schema Prisma)

## Cài đặt dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

## Cấu hình môi trường (env)

File mẫu có sẵn trong repo:
- `client/.env.example`
- `server/.env.example`

Tạo file chạy local:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Biến quan trọng:
- Frontend (`client/.env`): `VITE_API_URL`, `VITE_APP_NAME`
- Backend (`server/.env`): nhóm DB, `APP_PORT`, Supabase, JWT, email SMTP

Lưu ý: backend đang dùng thêm `JWT_REFRESH_SECRET` trong code, nhưng biến này chưa có trong `server/.env.example`.

## Quick start

Chạy đồng thời frontend + backend từ root:

```bash
npm run dev
```

Hoặc chạy riêng từng app:

```bash
npm run dev --prefix client
npm run dev --prefix server
```

## Lệnh hữu ích

```bash
# Frontend
npm run build --prefix client
npm run lint --prefix client

# Backend
npm run dev --prefix server
npm test --prefix server
```

`npm test --prefix server` hiện chỉ là placeholder, chưa phải bộ test tự động backend để dùng làm bằng chứng verification.

## Database/domain summary (onboarding)

Nguồn chuẩn schema: `server/prisma/schema.prisma`.

Các nhóm thực thể chính:
- Người dùng & phân quyền: `Users`, `Roles`, `Permissions`, `UserAddresses`
- Catalog sản phẩm: `Categories`, `Brands`, `Suppliers`, `Products`, `ProductVariants`, `ProductImages`, `AttributeKeys`, `VariableAttributes`
- Bán hàng: `Carts`, `CartItems`, `Orders`, `OrderItems`, `Coupons`, `Reviews`
- Vận hành kho: `StockMovements`, `PurchaseOrders`, `PurchaseOrderItems`
- Audit: `SystemLogs`

Luồng order/inventory ở mức cao:
1. Người dùng thêm biến thể sản phẩm vào `Carts`/`CartItems`.
2. Checkout tạo `Orders` + `OrderItems`, áp coupon (nếu có), chốt payment status.
3. Khi bán/điều chỉnh kho phát sinh `StockMovements` (OUT/ADJUSTMENT).
4. Khi nhập hàng từ nhà cung cấp quản lý qua `PurchaseOrders` + `PurchaseOrderItems`, cập nhật tồn kho tương ứng.

## Cấu trúc thư mục cấp cao

```text
SportNexus/
├─ client/              # Frontend React + Vite
├─ server/              # Express API + Prisma schema
├─ docs/                # Tài liệu tham khảo
├─ package.json         # Root scripts (orchestration)
└─ README.md            # Tài liệu onboarding tổng quan
```

## Tài liệu chi tiết theo khu vực

- Frontend: `client/README.md`
- Backend: `server/README.md`
- Documentation: `docs/README.md`

## Ghi chú quan trọng

- `docs/` là tài liệu tham khảo, có thể lệch với code hiện tại.
- Không dùng npm workspaces; dependency của `client/` và `server/` được quản lý riêng.
