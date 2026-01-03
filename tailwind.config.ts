import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1", // Indigo 500
          hover: "#4f46e5",   // Indigo 600
        },
        secondary: {
          DEFAULT: "#06b6d4", // Cyan 500
          hover: "#0891b2",   // Cyan 600
        },
        background: {
          light: "#f8fafc",   // Slate 50
          dark: "#0f172a",    // Slate 900
        },
        surface: {
          DEFAULT: "#1e293b", // Slate 800
          hover: "#334155",   // Slate 700
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fast-fade-in': 'fadeIn 0.15s cubic-bezier(0.2, 1, 0.2, 1) forwards',
        'fast-slide-up': 'slideUp 0.2s cubic-bezier(0.2, 1, 0.2, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(4px) scale(0.99)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
