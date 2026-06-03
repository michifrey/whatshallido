/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff0f7",
          100: "#ffe3f1",
          200: "#ffc6e3",
          300: "#ff97cb",
          400: "#fb56a8",
          500: "#ec0f83",
          600: "#d10071",
          700: "#ac005d",
          800: "#8d014d",
          900: "#750641",
          950: "#450022",
        },
        // Youth-Centre-Palette: tiefes "Ink", warmes Papier + kräftige Akzente
        ink: {
          DEFAULT: "#17141b",
          800: "#241f2c",
          700: "#332b3e",
        },
        paper: "#faf5ec",
        accent: "#2f6df6", // electric blue
        sun: "#f7c948", // warm yellow
        mint: "#13c296", // fresh green
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Archivo", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 16px rgba(15, 23, 42, 0.08)",
        cardlg: "0 12px 32px rgba(15, 23, 42, 0.14)",
        pop: "4px 4px 0 0 #17141b",
        popsm: "3px 3px 0 0 #17141b",
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
