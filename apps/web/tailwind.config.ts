import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/plugin-github/src/**/*.{ts,tsx}",
    "../../packages/plugin-npm/src/**/*.{ts,tsx}",
    "../../packages/plugin-vercel/src/**/*.{ts,tsx}",
    "../../packages/plugin-cloudflare/src/**/*.{ts,tsx}",
    "../../packages/plugin-razorpay/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0B0F19",
          secondary: "#0F1419",
          tertiary: "#1A1F2E",
        },
        accent: {
          electric: "#3B82F6",
          violet: "#8B5CF6",
          indigo: "#6366F1",
        },
        ink: {
          primary: "#FFFFFF",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.4)",
        "glow-violet": "0 0 20px rgba(139, 92, 246, 0.4)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
