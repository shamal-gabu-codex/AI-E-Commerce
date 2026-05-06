import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#6b7280",
        mist: "#f8f9fa",
        panel: "#ffffff",
        line: "#e6e9ef",
        primary: "#2196f3",
        violet: "#673ab7",
        teal: "#10b981",
        amber: "#f59e0b",
        coral: "#ef4444",
        sky: "#3b82f6"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.07)",
        lift: "0 10px 24px rgba(33, 150, 243, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
