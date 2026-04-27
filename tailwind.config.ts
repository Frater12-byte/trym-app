import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8EE",
        peach: {
          DEFAULT: "#FFE8DA",
          deep: "#FFD4B8",
        },
        "green-tint": "#E8F0EC",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#4A4A4A",
          mute: "#8A8A8A",
        },
        tangerine: {
          DEFAULT: "#FF6B35",
          dark: "#E0531F",
        },
        green: {
          DEFAULT: "#0E4D3F",
          light: "#1B6B58",
        },
        saffron: "#FFD23F",
        "pill-success": "#D4E8D8",
        "pill-warn": "#FFD9D2",
        "pill-warn-ink": "#7A2B14",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "6px 6px 0 #1A1A1A",
        "card-sm": "4px 4px 0 #1A1A1A",
        "card-xs": "3px 3px 0 #1A1A1A",
        "card-hover": "8px 8px 0 #1A1A1A",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
