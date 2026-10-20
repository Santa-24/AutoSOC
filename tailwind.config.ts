import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // AutoSOC bespoke palette (editorial brutalism + cyber operations)
        charcoal: {
          950: "#0D0F0C",
          900: "#141613", // base canvas
          850: "#1B1E19", // card surface
          800: "#232720", // elevated surface
          750: "#2A2E26", // interactive hover
          700: "#343A30", // borders / dividers
          600: "#4B5345", // muted outline
        },
        ivory: {
          50: "#FAF9F6",
          100: "#F3F0E7", // warm ivory primary text
          200: "#E3DFD4",
          300: "#C9C5B9",
          400: "#A9A599",
          500: "#89867B",
        },
        lime: {
          400: "#D6FF85",
          500: "#C7F36B", // acid-lime / chartreuse focal accent
          600: "#A7D648",
          700: "#7CA52C",
          800: "#445C16",
          900: "#22310B",
          950: "#141F05",
        },
        mineral: {
          300: "#B8BDB0",
          400: "#9AA092",
          500: "#7D8475",
          600: "#606758",
          700: "#43493D",
          800: "#2E332B",
        },
        // Restrained severity alerts
        alert: {
          critical: "#FF4747",
          "critical-bg": "#2E1111",
          high: "#FF823C",
          "high-bg": "#2E1C11",
          medium: "#F5B438",
          "medium-bg": "#2E2411",
          low: "#96C252",
          "low-bg": "#1D2B10",
          info: "#8EA0B5",
          "info-bg": "#17202B",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        widest: "0.15em",
        mega: "0.25em",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker": "ticker 35s linear infinite",
        "scanner": "scanner 4s ease-in-out infinite alternate",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scanner: {
          "0%": { opacity: "0.1", transform: "translateY(0%)" },
          "50%": { opacity: "0.4" },
          "100%": { opacity: "0.1", transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
