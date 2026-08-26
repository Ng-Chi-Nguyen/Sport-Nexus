/** @type {import('tailwindcss').Config} */
export default {
  // 1. Kích hoạt Dark Mode bằng class 'dark' ở <html>
  darkMode: 'class',

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'xs': '480px',   // Mobile ngang
      'sm': '640px',   // Tablet dọc
      'md': '768px',   // Tablet ngang
      'lg': '1024px',  // Laptop
      'xl': '1280px',  // Desktop chuẩn
      '2xl': '1536px', // Màn hình lớn
    },
    extend: {
      fontFamily: {
        // Đã thêm các font hệ thống dự phòng hỗ trợ chuẩn Unicode Tiếng Việt
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Montserrat"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'heading-lg': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'heading-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'tiny': ['0.625rem', { lineHeight: '1rem' }],
      },
      colors: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        // Tối ưu hóa hệ thống màu sắc
        light: {
          bg: '#f8fafc',      // Slate 50
          sidebar: '#ffffff', // Trắng thuần
          border: '#e2e8f0',   // Slate 200
          text: '#0f172a',    // Slate 900
          muted: '#64748b',    // Slate 500
        },
        dark: {
          bg: '#080C14',       // Xám đen sâu
          sidebar: '#0D121F',  // Sidebar tối
          border: '#1e293b',   // Slate 800
          text: '#f8fafc',    // Slate 50
          muted: '#94a3b8',    // Slate 400
        }
      },

      keyframes: {
        borderFlow1: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(200%)' } },
        borderFlow2: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(200%)' } },
        borderFlow3: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-200%)' } },
        borderFlow4: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-200%)' } },
        particleExplosion: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { transform: 'translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0)', opacity: '0' }
        },
        ringPulse: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        sparkFlash: {
          '0%': { transform: 'rotate(var(--r)) translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'rotate(var(--r)) translateX(30px) scale(0)', opacity: '0' }
        },
        infiniteScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        border1: 'borderFlow1 2s linear infinite',
        border2: 'borderFlow2 2s linear infinite',
        border3: 'borderFlow3 2s linear infinite',
        border4: 'borderFlow4 2s linear infinite',
        'infinite-scroll': 'infiniteScroll 30s linear infinite',
      }
    },
  },
  plugins: [],
}