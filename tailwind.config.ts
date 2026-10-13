import type { Config } from "tailwindcss";

/**
 * Colors are driven by CSS custom properties (see src/index.css) so the whole
 * palette swaps cleanly between the dark (default) and light themes. The signature
 * "spectrum" gradient lives in CSS so both themes and the <canvas>-free rail agree.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2) / <alpha-value>)",
        exact: "rgb(var(--exact) / <alpha-value>)",
        close: "rgb(var(--close) / <alpha-value>)",
        off: "rgb(var(--off) / <alpha-value>)",
        truth: "rgb(var(--truth) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Sora"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.08), 0 10px 30px -14px rgb(0 0 0 / 0.35)",
        glow: "0 0 0 1px rgb(var(--accent) / 0.35), 0 10px 34px -10px rgb(var(--accent) / 0.5)",
        lift: "0 18px 40px -16px rgb(0 0 0 / 0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--exact) / 0.55)" },
          "100%": { boxShadow: "0 0 0 14px rgb(var(--exact) / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        pop: "pop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulse-ring 0.7s ease-out 1",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
