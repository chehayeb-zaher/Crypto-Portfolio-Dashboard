import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        up: "#16A672",
        down: "#D6394A",
        navy: "#12104A",
        "navy-2": "#0B0930",
        ink: "#181259",
        cream: "#F4F1E6",
        mist: "#EBE8DC",
        muted: "#5A5578",
        line: "rgba(24, 18, 89, 0.14)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "-apple-system", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 14s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
