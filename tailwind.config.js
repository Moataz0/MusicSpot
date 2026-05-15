/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        txt: "rgb(var(--color-text) / <alpha-value>)",
        "txt-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "tab-bar": "rgb(var(--color-tab-bar) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}
