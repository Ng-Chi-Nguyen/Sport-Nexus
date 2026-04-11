# Client (Frontend)

## Vai trò

`client/` là SPA frontend cho SportNexus, xây trên React + Vite để render giao diện người dùng và gọi API từ backend.

## Stack chính

- React 19
- Vite
- React Router
- TanStack Query
- Tailwind CSS

## Entry points và route quan trọng

- Bootstrap app: `src/main.jsx`
  - Khởi tạo `RouterProvider`
  - Bọc app bằng `QueryClientProvider`
- Route root: `src/routes/index.jsx`
  - Chia route theo module:
    - `src/routes/webRoute.jsx`
    - `src/routes/authRoute.jsx`
    - `src/routes/adminRoutes.jsx`

## Biến môi trường

Khai báo trong file env local (tạo từ `.env.example`):

- `VITE_API_URL`: URL backend API
- `VITE_APP_NAME`: tên ứng dụng hiển thị ở frontend

## Scripts

Chạy trong thư mục root repo:

- `npm run dev --prefix client` — chạy frontend local (Vite dev server)
- `npm run build --prefix client` — build production
- `npm run lint --prefix client` — lint mã nguồn frontend
- `npm run preview --prefix client` — preview bản build local
