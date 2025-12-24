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
})