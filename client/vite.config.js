import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load toàn bộ biến môi trường từ file .env dựa trên mode hiện tại
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envPrefix: ['VITE_', 'PHONE_ME'],
    // Ưu tiên dùng biến env.VITE_BASE_PATH
    base: env.VITE_BASE_PATH || (mode === 'production' ? '/Sport-Nexus/' : '/'),
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})