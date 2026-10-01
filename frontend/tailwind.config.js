/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        black: '#000000',
        obsidian: '#0a0a0a',
        card: {
          light: '#e5e5e5',
          dark: '#121212',
          highlight: '#d5c7a3', // Warm gold/sand accent card from testimonial screenshot
        },
      },
      boxShadow: {
        'editorial': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'glow-white': '0 0 20px rgba(255, 255, 255, 0.15)',
      },
    },
  },
  plugins: [],
}
