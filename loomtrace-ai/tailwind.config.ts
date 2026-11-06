import type { Config } from "tailwindcss";

/**
 * Design tokens live here, not scattered as magic values across
 * components — this is what Phase 3 (landing page, dashboards) builds
 * against, and what keeps "premium enterprise SaaS" visually consistent
 * rather than accidental per-page.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutral-first palette (Linear/Vercel-style), with a single
        // accent used deliberately, not sprayed everywhere.
        accent: {
          50: "#fef6ee",
          100: "#fdead3",
          400: "#f5975a",
          500: "#ee7b35", // handloom-inspired warm terracotta, not generic SaaS blue
          600: "#df611f",
          700: "#b94a19",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(0,0,0,0.06)",
        glass: "0 1px 1px rgba(255,255,255,0.4) inset, 0 8px 32px -8px rgba(0,0,0,0.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
