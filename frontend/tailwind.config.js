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
        card: "0 8px 24px rgba(57, 86, 86, 0.07)",
        hover: "0 14px 30px rgba(57, 86, 86, 0.11)",
        glow: "0 10px 24px rgba(15, 177, 210, 0.2)",
      },

      colors: {
        primary: "#0FB1D2",
        // Legacy utility aliases keep every existing component on the wellness
        // palette while the UI continues to use its established class names.
        green: {
          50: "#ECF7F3", 100: "#DDEEEB", 300: "#A8D2CC",
          500: "#73ABA6", 600: "#548F8A", 700: "#395656",
        },
        emerald: {
          50: "#ECF7F3", 400: "#73ABA6", 500: "#73ABA6",
          600: "#548F8A", 700: "#395656",
        },
        blue: {
          50: "#E1F8FD", 100: "#CBEFF8", 500: "#0FB1D2",
          600: "#0C91AE", 700: "#395656",
        },
        purple: {
          50: "#F7EAEC", 100: "#F1DCE0", 200: "#E7C3CB", 600: "#A64253",
        },
        orange: {
          50: "#F8FFE5", 500: "#73ABA6", 600: "#395656",
        },
        yellow: {
          50: "#F8FFE5", 400: "#73ABA6", 500: "#395656", 600: "#395656",
        },
        red: {
          50: "#F7EAEC", 100: "#F1DCE0", 300: "#D89AA6", 400: "#C66C7B",
          500: "#A64253", 600: "#8A3444", 700: "#6D2936",
        },
        gray: {
          50: "#FBFCFC", 100: "#F0F5F4", 200: "#E1ECEA", 300: "#CADBD8",
          400: "#8BA39F", 500: "#6B8582", 600: "#526E6B", 700: "#395656",
          800: "#2F4B4B", 900: "#213A3A",
        },
        wellness: {
          slate: "#395656",
          aqua: "#0FB1D2",
          mauve: "#A64253",
          teal: "#73ABA6",
          cream: "#F8FFE5",
          mist: "#ECF7F3",
        },
      },

      borderRadius: {
        wellness: "1.5rem",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },

    },
  },

  plugins: [],
};
