/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tulipPink: "#f8c8dc",
        tulipWhite: "#fff8f9",
        tulipGreen: "#a8d5ba",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        tuliptheme: {
          "primary": "#f8c8dc",
          "secondary": "#a8d5ba",
          "accent": "#fff8f9",
          "neutral": "#f9e6ee",
          "base-100": "#fff8f9",
          "info": "#93c5fd",
          "success": "#86efac",
          "warning": "#fde68a",
          "error": "#fca5a5",
        },
      },
    ],
  },
}
