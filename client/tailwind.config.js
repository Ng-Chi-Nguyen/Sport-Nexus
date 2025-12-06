/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF5722", // Màu cam SportNexus
        dark: "#121212"      // Màu nền tối
      }
    },
  },
  plugins: [],
}