/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/**/*.test.{js,ts,jsx,tsx}",
    "!./src/**/*.spec.{js,ts,jsx,tsx}",
    "!./src/**/*.stories.{js,ts,jsx,tsx}",
    "!./src/**/*.d.ts",
    "!./node_modules/**/*"
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        foreground: '#e2e0dc',
        primary: '#2a2a2a',
        accent: '#e2e0dc',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
      },
    },
  },
  plugins: [],
} 