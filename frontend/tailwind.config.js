/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {

      boxShadow: {
        card: "0 8px 30px rgba(15,23,42,.05)",
        hover: "0 16px 40px rgba(15,23,42,.08)",
      },

      colors: {
        primary: "#A1E8CC",
      },

    },
  },

  plugins: [],
};