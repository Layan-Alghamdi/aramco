/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0C7C59",
          50: "#E7F5F0",
          700: "#0A5C44",
        },
        accent: "#00A19A",
        dark: "#0A1F1A",
      },
    },
  },
  plugins: [],
}
