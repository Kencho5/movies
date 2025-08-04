/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    colors: {
      neutral: {
        50: "#f5f5f5",
        100: "#e5e5e5",
        200: "#d4d4d4",
        300: "#a3a3a3",
        400: "#737373",
        500: "#525252",
        600: "#3f3f3f",
        700: "#2f2f2f",
        800: "#1f1f1f",
        900: "#111111",
      },
      primary: {
        50: "#ffeaea",
        100: "#ffd5d7",
        200: "#ffb0b4",
        300: "#ff7a84",
        400: "#ff4958",
        500: "#e50914",
        600: "#d10913",
        700: "#b00710",
        800: "#8c060d",
        900: "#66040a",
      },
      red: {
        500: "#e50914",
        600: "#d10913",
        700: "#b00710",
      },
      yellow: {
        100: "#fff9c2",
        200: "#fff085",
        300: "#ffe047",
        400: "#ffd11a",
        500: "#f5c518",
        600: "#d9b00d",
        700: "#b08800",
        800: "#8c6900",
        900: "#6b4f00",
      },
      green: {
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
      },
      bg: {
        dark: "#0b0b0f",
        card: "#141418",
        highlight: "#1b1b20",
      },
      black: "#000000",
      white: "#ffffff",
      transparent: "transparent",
    },
    extend: {
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
