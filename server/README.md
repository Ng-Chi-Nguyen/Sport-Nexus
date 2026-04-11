# Server (Backend)

## Vai trò

`server/` là backend API cho SportNexus, cung cấp các endpoint nghiệp vụ và kết nối database.

## Kiến trúc chính

- Entrypoint: `src/index.js` (khởi tạo Express, CORS, middleware JSON/form, mount routes)
- Route grouping: `src/routes/index.route.js` theo nhóm:
  - `management`
  - `customer`
  - `core`
  - `auth`
  - `web`
- `email`
- API prefix runtime: `/api/v1/`
- ORM và schema: Prisma (`prisma/schema.prisma` là source of truth)
- Auth: JWT access token + refresh token
- Storage: Supabase Storage
- Mail: Nodemailer

## Biến môi trường

Khai báo trong file env local (tạo từ `.env.example`):

- Database:
  - `DATABASE_URL`
  - `DATABASE_USER`
  - `DATABASE_PASSWORD`
  - `DATABASE_NAME`
  - `DATABASE_HOST`
  - `DATABASE_PORT`
- App:
  - `APP_PORT`
- Supabase:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_GENERAL_BUCKET_NAME`
- JWT:
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET` (đang được dùng trong `src/services/auth/auth.service.js` nhưng hiện chưa có trong `.env.example`, cần bổ sung khi setup)
- Mail:
  - `EMAIL_ADMIN`
  - `EMAIL_PASS`

## Scripts

Chạy trong thư mục root repo:

- `npm run dev --prefix server` — chạy backend với nodemon
- `npm test --prefix server` — script placeholder, chưa phải test suite thực tế

## Onboarding database

- Repo hiện chưa cung cấp migration, seed, hoặc script bootstrap DB hoàn chỉnh trong `server/prisma/` hay `package.json`.
- `prisma/schema.prisma` là nguồn chuẩn để hiểu model runtime, nhưng việc dựng database local sạch có thể cần schema/dữ liệu hoặc quy trình nội bộ nằm ngoài repo.
- Khi cấu hình frontend, hãy đảm bảo `VITE_API_URL` phía client trỏ đúng backend base path `/api/v1/`.

## Lưu ý verification

- Backend hiện chưa có test tự động đáng tin cậy.
- Khi thay đổi schema, luôn xem `prisma/schema.prisma` là nguồn chính xác nhất.
