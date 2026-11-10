/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          input: "var(--color-border-input)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          light: "var(--color-accent-light)",
          foreground: "var(--color-on-accent)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          light: "var(--color-danger-light)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          light: "var(--color-success-light)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
        },
        income: "var(--color-income)",
        expense: "var(--color-expense)",
        transfer: "var(--color-transfer)",
        wise: {
          canvas: "#E8EBE6",
          ink: "#0E0F0C",
          lime: "#9FE870",
          limeHover: "#86D454",
          forest: "#054D28",
          crimson: "#A7000D",
          border: "#D5D8CF",
          mute: "#5B5F5A",
          soft: "#F4F6F2",
          cardDark: "#1B1E19",
          borderDark: "#2B3028",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
