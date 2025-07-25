/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    colors: {
      // Rich dark theme with subtle gradations
      neutral: {
        50: "#f6f6f6",
        100: "#e7e7e7",
        200: "#d1d1d1",
        300: "#b0b0b0",
        400: "#888888",
        500: "#6d6d6d",
        600: "#5d5d5d",
        700: "#4f4f4f",
        800: "#3d3d3d",
        900: "#151515",
      },
      // Premium blue accent color
      primary: {
        50: "#edf8ff",
        100: "#deefff",
        200: "#b6e1ff",
        300: "#75c6ff",
        400: "#3baaff",
        500: "#0a84ff", // Apple TV blue
        600: "#0071e3",
        700: "#0058b9",
        800: "#004997",
        900: "#003b7a",
      },
      // Netflix-inspired red
      red: {
        500: "#e50914",
        600: "#d10913",
        700: "#b00710",
      },
      // Add yellow colors for IMDb elements
      yellow: {
        100: "#fff9c2",
        200: "#fff085",
        300: "#ffe047",
        400: "#ffd11a",
        500: "#f5c518", // IMDb yellow
        600: "#d9b00d",
        700: "#b08800",
        800: "#8c6900",
        900: "#6b4f00",
      },
      // Add green colors for status indicators
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
      // Background colors
      bg: {
        dark: "#0e0f12", // Main background
        card: "#161822", // Card background
        highlight: "#1f2230", // Hover/highlight states
      },
      // Essential colors
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
