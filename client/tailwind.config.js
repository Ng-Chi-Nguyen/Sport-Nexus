/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // 1. Định nghĩa các mốc màn hình (Breakpoints)
    screens: {
      'xs': '480px',   // Mobile ngang
      'sm': '640px',   // Tablet dọc
      'md': '768px',   // Tablet ngang
      'lg': '1024px',  // Laptop
      'xl': '1280px',  // Desktop chuẩn
      '2xl': '1536px', // Màn hình lớn
    },
    extend: {
      // 2. Định nghĩa Font chữ cho phong cách thể thao
      fontFamily: {
        // Font chính cho nội dung (Sạch sẽ, dễ đọc)
        sans: ['"Inter"', 'sans-serif'],
        // Font cho tiêu đề
        display: ['"Montserrat"', 'sans-serif'],
      },
      // 3. Định nghĩa kích thước chữ tùy chỉnh
      fontSize: {
        'heading-lg': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'heading-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'tiny': ['0.625rem', { lineHeight: '1rem' }], // 10px
      },
      colors: {
        'primary': '#4facf3',
        'btn': 'bg-blue-500',
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
      },
      animation: {
        border1: 'borderFlow1 2s linear infinite',
        border2: 'borderFlow2 2s linear infinite',
        border3: 'borderFlow3 2s linear infinite',
        border4: 'borderFlow4 2s linear infinite',
      }
    },
  },
  plugins: [],
}