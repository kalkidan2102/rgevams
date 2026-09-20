export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        ssgiBlue: "#1b4d6b",
        ssgiGold: "#ca933c",
        ssgiRed: "#d0232b",
      },
    },
  },
  plugins: [],
}
