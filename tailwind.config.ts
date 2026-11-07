import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Brand palette (matches the printed brochure). The old indigo/violet
      // classes across the site now render as navy / brass, so every page
      // shares one look without rewriting each class.
      colors: {
        indigo: {
          50: "#EEF1F6", 100: "#DCE2EC", 200: "#B9C4D8", 300: "#8F9DBB", 400: "#5E709A",
          500: "#34497A", 600: "#1C3157", 700: "#142646", 800: "#0E1E3A", 900: "#0A1529", 950: "#060D1A",
        },
        violet: {
          50: "#FBF6EC", 100: "#F4E8CF", 200: "#E9D3A6", 300: "#DDBC7C", 400: "#D0A85E",
          500: "#C49A4A", 600: "#A9803A", 700: "#8A6830", 800: "#6B5126", 900: "#4F3C1D", 950: "#2E2311",
        },
        navy: { DEFAULT: "#0E1E3A", ink: "#13223F" },
        brass: { DEFAULT: "#C49A4A", light: "#E9DCC0", dark: "#A07C34" },
        paper: "#F7F6F2",
      },
      borderWidth: {
        "1.5": "1.5px",
      },
      animation: {
        "slide-up": "slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
