/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0066FF",
          hover: "#0052CC",
        },
      },
      borderRadius: {
        'smooth': '14px',
      },
      boxShadow: {
        'glow': '0 20px 80px -10px rgba(0, 102, 255, 0.15)',
        'float': '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}