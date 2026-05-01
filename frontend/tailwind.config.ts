import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        mist: "#f8fafc",
        panel: "#ffffff",
        line: "#e5e7eb",
        primary: "#6d28d9",
        violet: "#8b5cf6",
        teal: "#10b981",
        amber: "#f59e0b",
        coral: "#ef4444",
        sky: "#3b82f6"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.08)",
        lift: "0 10px 30px rgba(91, 33, 182, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
