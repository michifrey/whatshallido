/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f3",
          100: "#ffe4e8",
          200: "#fecdd6",
          300: "#fda4b4",
          400: "#fb7189",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 16px rgba(15, 23, 42, 0.08)",
        cardlg: "0 12px 32px rgba(15, 23, 42, 0.14)",
      },
      keyframes: {
        pop: { "0%": { transform: "scale(.95)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        fade: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: {
        pop: "pop .2s ease",
        fade: "fade .3s ease",
      },
    },
  },
  plugins: [],
};
