/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-green': '#10B981',
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
      },
    },
  },
  plugins: [],
} 