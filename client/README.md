# Client (Frontend)

## Vai trò

`client/` là ứng dụng frontend của SportNexus, phụ trách:
- Web mua hàng cho khách
- Luồng đăng nhập/đăng ký người dùng
- Khu vực quản trị (`/management`) cho quản lý hệ thống

## Stack chính

- React 19
- Vite 7
- React Router
- TanStack Query
- TailwindCSS
- Axios, React Hook Form, Zod

## Entry points quan trọng

- `src/main.jsx`: boot app + `QueryClientProvider` + `RouterProvider`
- `src/routes/index.jsx`: ghép route tree tổng
- `src/App.jsx`: layout public + điều kiện hiển thị cho management routes

## Tổ chức route/layout

- `src/routes/webRoute.jsx`: route web/public (home, profile)
- `src/routes/authRoute.jsx`: route auth (`/auth/login`, `/auth/register`)
- `src/routes/adminRoutes.jsx`: route admin (`/management/*`) + loaders

Lưu ý:
- App hiện phân nhánh layout theo prefix `/management` trong `App.jsx`.
- `App.jsx` đang dùng `h-screen overflow-hidden`; có thể ảnh hưởng scroll nếu chỉnh layout không cẩn thận.

## Biến môi trường

File mẫu: `.env.example`

- `VITE_API_URL`: base URL API backend
- `VITE_APP_NAME`: tên hiển thị ứng dụng

## Lệnh sử dụng

```bash
npm install --prefix client
npm run dev --prefix client
npm run build --prefix client
npm run lint --prefix client
```

## Ghi chú onboarding

- Alias `@` trỏ tới `client/src` (xem `vite.config.js`).
- Nếu thay đổi lazy route/component, cần bảo đảm có fallback loading phù hợp trong Router.
