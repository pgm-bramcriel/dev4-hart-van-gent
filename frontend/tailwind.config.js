/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Comme", "system-ui", "sans-serif"],
        secondary: ["Arimo", "system-ui", "sans-serif"],
      },
      colors: {
        accent: "#A4E3D8",
        text: "#1D1D1D",
        white: "#E9E9E9",
      },
    },
  },
};
