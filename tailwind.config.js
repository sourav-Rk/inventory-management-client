/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7', // Main Background
          100: '#F5EBE0', // Card Background
          200: '#E6DCCF',
          300: '#D6CDBF',
        },
        bronze: {
          500: '#D5B990', // Primary Action
          600: '#C4A87F',
          700: '#A68D68',
        },
        charcoal: {
          DEFAULT: '#3E3E3E', // Primary Text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
