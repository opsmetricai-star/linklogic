import type { Config } from "tailwindcss";

// Dark, high-contrast system. Token names are semantic roles:
// paper = page background, card = raised surface, ink = body text,
// forest = primary fill, lime = brand teal accent.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#030710",
        card: "#0A1224",
        raise: "#0F1B35",
        ink: "#D4E8FA",
        display: "#F2FAFF",
        forest: "#E5F4FF",
        lime: "#19C7CC",
        sky: "#86C9F5",
        muted: "#8CA6C4",
        line: "#1B2A4A",
        danger: "#FF7A7A",
        ok: "#4ADE9A",
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
