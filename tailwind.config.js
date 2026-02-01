import tailwindAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Roboto", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f1f6ff",
          100: "#e0ecff",
          200: "#c0d7ff",
          300: "#8fb8ff",
          400: "#5d95ff",
          500: "#3a74ff",
          600: "#2559db",
          700: "#1f48b0",
          800: "#1d3f8a",
          900: "#1c356b",
          950: "#142445",
        },
      },
    },
  },
  plugins: [tailwindAnimate],
}
