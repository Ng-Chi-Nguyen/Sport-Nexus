import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Giữ cái này để dùng cho các thư mục khác (ví dụ: @/services)
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,                     // Giúp "đánh lừa" server rằng request này đến từ cùng domain của server
        secure: false,                          // Bỏ qua kiểm tra chứng chỉ SSL nếu backend dùng https chưa chứng thực đầy đủ
        // optional: nếu API thật của bạn không có chữ '/api' ở đầu, dùng dòng dưới để loại bỏ nó khi gửi đi
        // rewrite: (path) => path.replace(/^\/api/, '') 
      },
    },
  },
})