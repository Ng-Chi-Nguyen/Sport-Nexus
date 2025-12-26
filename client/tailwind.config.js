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
        // Font cho tiêu đề (Mạnh mẽ, cá tính)
        display: ['"Montserrat"', 'sans-serif'],
      },
      // 3. Định nghĩa kích thước chữ tùy chỉnh
      fontSize: {
        'heading-lg': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'heading-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'tiny': ['0.625rem', { lineHeight: '1rem' }], // 10px
      },
    },
  },
  plugins: [],
}