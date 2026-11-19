import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F3EC",
        card: "#FBFAF6",
        ink: "#0E1B17",
        forest: "#12372C",
        lime: "#C8F560",
        muted: "#5B6B64",
        line: "#DAD6C8",
        danger: "#B3341F",
        ok: "#1F7A4D",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
