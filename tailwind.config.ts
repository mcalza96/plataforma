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
          DEFAULT: "#0d93f2",
          hover: "#0b7ad1",
        },
        background: {
          light: "#f5f7f8",
          dark: "#1A1A1A",
        },
        surface: {
          DEFAULT: "#252525",
          hover: "#2f2f2f",
        },
        violet: {
          neon: "#a855f7",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
