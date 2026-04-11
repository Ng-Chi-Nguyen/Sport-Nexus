# SportNexus

SportNexus là ứng dụng web thương mại điện tử trong lĩnh vực thể thao, chia thành hai ứng dụng độc lập:

- `client/`: frontend React 19 + Vite
- `server/`: backend Express 5 + Prisma (MySQL)

## Tổng quan kiến trúc

```text
Browser
  -> client/ (React Router + TanStack Query)
  -> gọi API /api/v1/*
server/ (Express 5)
  -> controllers/services/validators
  -> Prisma Client
MySQL

server/ còn tích hợp:
- JWT (access + refresh)
- Supabase Storage (upload media)
- Nodemailer (email)
```

## Công nghệ sử dụng

### Frontend (`client/`)
- React 19
- Vite 7
- React Router
- TanStack Query
- TailwindCSS + PostCSS
- Axios, Zod, React Hook Form

### Backend (`server/`)
- Express 5
- Prisma 5 + `@prisma/client`
- MySQL datasource (`provider = "mysql"`)
- JWT (`jsonwebtoken`)
- Supabase JS
- Nodemailer
- Multer + Sharp (xử lý upload ảnh)
- Joi (request validation)

## Yêu cầu môi trường

- Node.js 18+
- npm
- MySQL chạy được với schema tại `server/prisma/schema.prisma`

## Quick start

1) Cài dependency cho root, frontend, backend:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

2) Tạo file môi trường từ file mẫu:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

3) Chạy đồng thời frontend + backend:

```bash
npm run dev
```

Hoặc chạy riêng từng app:

```bash
npm run dev --prefix client
npm run dev --prefix server
```

## Tổng quan biến môi trường

### `client/.env`
- `VITE_API_URL`
- `VITE_APP_NAME`

### `server/.env`
- Database: `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_PORT`
- App: `APP_PORT`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_GENERAL_BUCKET_NAME`
- JWT: `JWT_ACCESS_SECRET`
- Mail: `EMAIL_ADMIN`, `EMAIL_PASS`

## Tóm tắt domain database

Schema nguồn sự thật: `server/prisma/schema.prisma`.

Các nhóm model chính:
- IAM: `Users`, `Roles`, `Permissions`
- Catalog: `Categories`, `Brands`, `Suppliers`, `Products`, `ProductImages`, `ProductVariants`, `AttributeKeys`, `VariableAttributes`
- Sales: `Coupons`, `Orders`, `OrderItems`, `Carts`, `CartItems`, `Reviews`
- Inventory/Purchase: `StockMovements`, `PurchaseOrders`, `PurchaseOrderItems`
- Audit: `SystemLogs`

## Lệnh hữu ích

```bash
# Root
npm run dev

# Frontend
npm run dev --prefix client
npm run build --prefix client
npm run lint --prefix client

# Backend
npm run dev --prefix server
npm test --prefix server
```

Lưu ý: `npm test --prefix server` hiện là placeholder (không phải test suite backend thật).

## Cấu trúc dự án

```text
SportNexus/
|- client/        # React app (web + management UI)
|- server/        # Express API + Prisma schema
|- docs/          # Tài liệu DB/nghiệp vụ (tham khảo)
|- AGENTS.md      # Quy ước làm việc cho agent
|- README.md      # Tài liệu tổng quan repo
```

## README theo thư mục

- `client/README.md`: trách nhiệm frontend, route/layout, env và lệnh chạy
- `server/README.md`: tổ chức backend, auth/storage/mail/db dependency, env và lệnh chạy
- `docs/README.md`: cách đọc tài liệu docs và cảnh báo source-of-truth

## Các điểm mismatch cần lưu ý

- `server/src/services/auth/auth.service.js` dùng `JWT_REFRESH_SECRET`, nhưng `server/.env.example` hiện chưa khai báo biến này.
- `server/src/configs/mail.config.js` đang log `EMAIL_ADMIN` và `EMAIL_PASS`; cần tránh log credential ở môi trường thật.
- `docs/` không có trong worktree hiện tại của task này, nên tài liệu DB bên ngoài mã nguồn có thể thiếu hoặc không đồng bộ.
- Khi có mâu thuẫn giữa tài liệu và mã nguồn, ưu tiên `server/prisma/schema.prisma` làm source-of-truth cho database.
