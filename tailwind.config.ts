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
      fontSize: {
        "fluid-h1": "clamp(2rem, 5vw + 1rem, 3.5rem)",
        "fluid-h2": "clamp(1.5rem, 3vw + 1rem, 2.5rem)",
        "fluid-h3": "clamp(1.25rem, 2vw + 1rem, 2rem)",
        "fluid-body": "clamp(0.875rem, 1vw + 0.5rem, 1.125rem)",
      },
      spacing: {
        "touch": "44px", // Minimum touch target size
      },
      boxShadow: {
        "premium": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        "glass": "inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.4)",
      },
      colors: {
        ftour: {
          background: "#1B0B0A",
          surface: "#2C1512",
          surfaceSoft: "rgba(44, 21, 18, 0.6)",
          accent: "#C79A3B",
          accentSoft: "#F1D7A3",
          danger: "#C0392B",
          success: "#27AE60",
          text: "#FDF4E3"
        }
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "marrakech-pattern":
          "radial-gradient(circle at 1px 1px, rgba(199,154,59,0.12) 1px, transparent 0)",
        "lantern-gradient":
          "radial-gradient(circle at top, rgba(199,154,59,0.35), transparent 60%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
      },
      backgroundSize: {
        "pattern-sm": "24px 24px"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    }
  },
  plugins: []
};

export default config;


