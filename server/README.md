# Server (Backend API)

## Vai trò

`server/` là API backend của SportNexus, phụ trách:
- Xử lý nghiệp vụ quản trị và khách hàng
- Xác thực/ủy quyền người dùng
- Truy cập dữ liệu qua Prisma
- Upload media qua Supabase Storage
- Gửi email qua Nodemailer

## Stack chính

- Express 5
- Prisma 5 + MySQL
- Joi validation
- JWT auth
- Supabase JS
- Nodemailer
- Multer + Sharp

## Entry points và tổ chức mã

- `src/index.js`: khởi tạo Express, CORS, parser, mount routes
- `src/routes/index.route.js`: tập trung khai báo route prefix `/api/v1/*`
- `src/controllers/**`: HTTP layer
- `src/services/**`: business logic
- `src/validators/**`: schema validate request
- `prisma/schema.prisma`: schema database nguồn sự thật

## Nhóm route chính

- `auth/*`: đăng nhập, đăng ký, refresh token, verify token
- `management/*`: route quản trị
- `customer/*`: route khách hàng
- `core/*`: route dùng chung core domain
- `home/*`: dữ liệu web/home
- `email/*`: gửi email

## Auth, permission, storage, mail, db dependencies

- Auth middleware: `src/middlewares/verifyToken.middlware.js` (`verifyToken`, `checkPermission`)
- JWT dùng trong `src/services/auth/auth.service.js`
- Supabase client: `src/configs/supabase.config.js`
- Mail transporter: `src/configs/mail.config.js`
- Prisma client: `src/db/prisma.js` + schema tại `prisma/schema.prisma`

## Biến môi trường

File mẫu: `.env.example`

### Database
- `DATABASE_URL`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `DATABASE_HOST`
- `DATABASE_PORT`

### App
- `APP_PORT`

### Supabase
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_GENERAL_BUCKET_NAME`

### JWT
- `JWT_ACCESS_SECRET`

### Mail
- `EMAIL_ADMIN`
- `EMAIL_PASS`

## Lệnh sử dụng

```bash
npm install --prefix server
npm run dev --prefix server
npm test --prefix server
```

## Mismatch cần chú ý

- Code đang dùng `JWT_REFRESH_SECRET` cho refresh token nhưng `.env.example` chưa khai báo biến này.
- Không xem `npm test --prefix server` là kiểm thử backend thực tế (đây là script placeholder).
