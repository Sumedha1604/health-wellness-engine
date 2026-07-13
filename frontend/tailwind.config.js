/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        background: "#F8FAF9",
        surface: "#FFFFFF",

        primary: "#A1E8CC",
        secondary: "#C5DECD",

        accent: "#FAC9B8",
        neutral: "#E5D4C0",

        text: "#1F2937",
        muted: "#6B7280",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      boxShadow: {
        card: "0 8px 30px rgba(15,23,42,.05)",
        hover: "0 16px 40px rgba(15,23,42,.08)",
      },
    },
  },

  plugins: [],
};