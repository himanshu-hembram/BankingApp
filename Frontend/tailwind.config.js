/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                // ✅ Vite entry
    "./src/**/*.{js,ts,jsx,tsx}",  // ✅ All React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
