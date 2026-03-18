# SportNexus

SportNexus là ứng dụng web thương mại điện tử cho lĩnh vực thể thao, được tách thành 2 phần chính:

- `client/`: frontend dùng React 19 + Vite + React Router + TanStack Query
- `server/`: backend dùng Express 5 + Prisma + JWT + Supabase Storage + Nodemailer

## Cấu trúc thư mục

```text
SportNexus/
|- client/   # Ứng dụng frontend
|- server/   # API backend và Prisma schema
|- docs/     # Tài liệu tham khảo
|- AGENTS.md # Hướng dẫn cho coding agents
```

## Yêu cầu

- Node.js 18+
- npm
- Cơ sở dữ liệu phù hợp với `server/prisma/schema.prisma`

## Cài đặt

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Tạo file môi trường từ các file mẫu:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## Chạy dự án

Chạy cả frontend và backend:

```bash
npm run dev
```

Hoặc chạy riêng từng phần:

```bash
npm run dev --prefix client
npm run dev --prefix server
```

## Lệnh hữu ích

```bash
npm run build --prefix client
npm run lint --prefix client
npm test --prefix server
```

Lưu ý: `npm test --prefix server` hiện chỉ là placeholder, không phải bộ test backend thực tế.

## Ghi chú

- `server/prisma/schema.prisma` là nguồn sự thật cho schema database.
- `docs/` chỉ là tài liệu tham khảo, không đảm bảo luôn đồng bộ với mã nguồn.
- Repo hiện không dùng npm workspaces; `client/` và `server/` quản lý dependency riêng.
