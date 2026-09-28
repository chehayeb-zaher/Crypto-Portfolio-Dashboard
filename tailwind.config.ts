import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        up: "#16C784",
        down: "#EA3943",
        primary: "#3861FB",
        ink: "#0D1421",
        muted: "#616E85",
        line: "#EFF2F5",
        surface: "#F5F6FA",
      },
      fontFamily: {
        display: ["var(--font-body)", "-apple-system", "sans-serif"],
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
