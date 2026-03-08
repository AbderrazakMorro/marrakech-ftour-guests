import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ftour: {
          background: "#1B0B0A",
          surface: "#2C1512",
          accent: "#C79A3B",
          accentSoft: "#F1D7A3",
          danger: "#C0392B",
          success: "#27AE60",
          text: "#FDF4E3"
        }
      },
      fontFamily: {
        display: ["system-ui", "ui-sans-serif", "sans-serif"],
        body: ["system-ui", "ui-sans-serif", "sans-serif"]
      },
      backgroundImage: {
        "marrakech-pattern":
          "radial-gradient(circle at 1px 1px, rgba(199,154,59,0.12) 1px, transparent 0)",
        "lantern-gradient":
          "radial-gradient(circle at top, rgba(199,154,59,0.35), transparent 60%)"
      },
      backgroundSize: {
        "pattern-sm": "24px 24px"
      }
    }
  },
  plugins: []
};

export default config;


