/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "box-yellow": "#F8D948",
        "primary-dark": "#1a1b26",
      },
    },
  },
  plugins: [],
};
