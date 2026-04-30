import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        mist: "#f4f7f6",
        teal: "#0f766e",
        amber: "#b7791f",
        coral: "#e05f4f"
      }
    }
  },
  plugins: []
};

export default config;
