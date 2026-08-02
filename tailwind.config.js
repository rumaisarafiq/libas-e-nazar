/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F6F1",
        gold: {
          DEFAULT: "#C9A86A",
          light: "#E5C98B",
          dark: "#B8934A",
          btnFrom: "#C79B4E",
          btnTo: "#D8B36A",
          btnHoverFrom: "#D8B36A",
          btnHoverTo: "#E5C98B",
        },
        beige: "#E5D9C3",
        charcoal: "#1C1B19",
        surface: "#1A1817",
        surfaceRaised: "#221F1D",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Manrope"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(20, 18, 16, 0.18)",
        card: "0 8px 24px -8px rgba(201, 168, 106, 0.35)",
        lift: "0 20px 40px -15px rgba(20, 18, 16, 0.35)",
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeInSlow: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanSweep: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(300%)" },
        },
        modalPop: {
          "0%": { opacity: 0, transform: "scale(0.92) translateY(8px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out forwards",
        fadeInSlow: "fadeInSlow 1s ease-out forwards",
        shimmer: "shimmer 2.5s infinite linear",
        spinSlow: "spinSlow 8s linear infinite",
        scanSweep: "scanSweep 1.8s ease-in-out infinite",
        modalPop: "modalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
